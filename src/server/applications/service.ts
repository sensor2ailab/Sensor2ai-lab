import type { Application } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { cursorArgs, toPage, type Page } from "@/server/http/pagination";
import { hashPassword, generateSecurePassword } from "@/server/auth/password";
import { logAction } from "@/server/audit/audit";
import { accountApproved, accountApprovedExisting, type MailDraft } from "@/server/mail/drafts";

export interface SubmitApplicationInput {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  coverLetter?: string;
  resumeLink: string;
}

// Public submission: reject closed jobs, then record the application. The resume is
// a link the applicant shares (e.g. Google Drive, view access), so there is no file
// upload or storage to manage.
export async function submitApplication(input: SubmitApplicationInput): Promise<Application> {
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job) throw Errors.notFound("Job not found");
  if (!job.isOpen) throw Errors.badRequest("This position is no longer accepting applications");

  return prisma.application.create({
    data: {
      jobId: input.jobId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      coverLetter: input.coverLetter,
      resumeLink: input.resumeLink,
    },
  });
}

export interface ListApplicationsParams {
  jobId?: string;
  status?: "pending" | "approved" | "rejected" | "withdrawn";
  limit: number;
  cursor?: string;
}

export async function listApplications(p: ListApplicationsParams): Promise<Page<Application>> {
  const rows = await prisma.application.findMany({
    where: { ...(p.jobId ? { jobId: p.jobId } : {}), ...(p.status ? { status: p.status } : {}) },
    ...cursorArgs(p.limit, p.cursor),
  });
  return toPage(rows, p.limit);
}

export async function getApplication(id: string): Promise<Application> {
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) throw Errors.notFound("Application not found");
  return application;
}

export interface ApprovalDraft {
  draft: MailDraft;
  // Plaintext temp password for a newly-created account (null when the applicant
  // already has an account). The admin must send this in the draft before the
  // approval is finalized with the same value.
  tempPassword: string | null;
  existingUser: boolean;
}

// Step 1 of approval: build the welcome email (with fresh credentials) WITHOUT
// committing anything, so the admin can send it first. Nothing is written here.
export async function prepareApproval(id: string): Promise<ApprovalDraft> {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) throw Errors.notFound("Application not found");
  if (app.status === "approved") throw Errors.conflict("Application is already approved");
  if (app.status !== "pending") {
    throw Errors.badRequest(`Cannot approve a ${app.status} application`);
  }

  const existing = await prisma.user.findUnique({ where: { email: app.email } });
  if (existing) {
    return {
      draft: accountApprovedExisting({ to: app.email, name: app.name }),
      tempPassword: null,
      existingUser: true,
    };
  }
  const tempPassword = generateSecurePassword();
  return {
    draft: accountApproved({ to: app.email, name: app.name, tempPassword }),
    tempPassword,
    existingUser: false,
  };
}

export interface ApproveResult {
  application: Application;
  userId: string;
  created: boolean;
}

// Step 2 of approval: commit. Called only after the admin has sent the welcome
// email. Idempotent + double-approve safe: status is re-checked inside the
// transaction; an existing email links instead of failing. For a new account the
// caller passes the same tempPassword that was emailed in step 1.
export async function approveApplication(
  id: string,
  reviewerId: string,
  tempPassword: string | null,
  ip?: string,
): Promise<ApproveResult> {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) throw Errors.notFound("Application not found");
  if (app.status === "approved") throw Errors.conflict("Application is already approved");
  if (app.status !== "pending") {
    throw Errors.badRequest(`Cannot approve a ${app.status} application`);
  }

  const existing = await prisma.user.findUnique({ where: { email: app.email } });
  if (!existing && !tempPassword) {
    throw Errors.badRequest("Prepare the approval email before approving");
  }
  const passwordHash = existing ? null : await hashPassword(tempPassword as string);

  const result = await prisma.$transaction(async (tx) => {
    const fresh = await tx.application.findUnique({ where: { id } });
    if (!fresh || fresh.status !== "pending") {
      throw Errors.conflict("Application is no longer pending");
    }
    let user = await tx.user.findUnique({ where: { email: app.email } });
    let created = false;
    if (!user) {
      user = await tx.user.create({
        data: {
          email: app.email,
          fullName: app.name,
          phone: app.phone,
          role: "user",
          passwordHash: passwordHash as string,
          mustChangePassword: true,
        },
      });
      created = true;
    }
    const application = await tx.application.update({
      where: { id },
      data: {
        status: "approved",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        createdUserId: user.id,
      },
    });
    return { application, userId: user.id, created };
  });

  await logAction({
    actorId: reviewerId,
    action: "application.approve",
    entity: "application",
    entityId: id,
    metadata: { userId: result.userId, createdUser: result.created },
    ip,
  });

  return result;
}

// Simple reject: mark rejected, no email.
export async function rejectApplication(
  id: string,
  reviewerId: string,
  ip?: string,
): Promise<Application> {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) throw Errors.notFound("Application not found");
  if (app.status !== "pending") {
    throw Errors.badRequest(`Cannot reject a ${app.status} application`);
  }

  const application = await prisma.application.update({
    where: { id },
    data: { status: "rejected", reviewedBy: reviewerId, reviewedAt: new Date() },
  });

  await logAction({
    actorId: reviewerId,
    action: "application.reject",
    entity: "application",
    entityId: id,
    ip,
  });
  return application;
}
