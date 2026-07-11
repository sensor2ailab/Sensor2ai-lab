import type { Application } from "@prisma/client";

// Admin-facing application shape. The resume is a link the applicant shared.
export interface ApplicationDto {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  college: string | null;
  resumeLink: string;
  coverLetter: string | null;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  reviewedAt: string | null;
  createdAt: string;
}

export function toApplicationDto(app: Application): ApplicationDto {
  return {
    id: app.id,
    jobId: app.jobId,
    name: app.name,
    email: app.email,
    phone: app.phone,
    college: app.college,
    resumeLink: app.resumeLink,
    coverLetter: app.coverLetter,
    status: app.status,
    reviewedAt: app.reviewedAt?.toISOString() ?? null,
    createdAt: app.createdAt.toISOString(),
  };
}
