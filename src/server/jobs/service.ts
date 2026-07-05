import type { Job } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { cursorArgs, toPage, type Page } from "@/server/http/pagination";

export interface CreateJobInput {
  title: string;
  description: string;
  location?: string | null;
  employmentType?: string | null;
  isOpen?: boolean;
}

export async function createJob(input: CreateJobInput, createdBy: string): Promise<Job> {
  return prisma.job.create({ data: { ...input, isOpen: input.isOpen ?? true, createdBy } });
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  location?: string | null;
  employmentType?: string | null;
  isOpen?: boolean;
}

export async function updateJob(id: string, patch: UpdateJobInput): Promise<Job> {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw Errors.notFound("Job not found");
  return prisma.job.update({ where: { id }, data: patch });
}

export async function getJob(id: string): Promise<Job> {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw Errors.notFound("Job not found");
  return job;
}

// Deletes a position and, via the schema's cascade, its applications.
export async function deleteJob(id: string): Promise<void> {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw Errors.notFound("Job not found");
  await prisma.job.delete({ where: { id } });
}

export async function listOpenJobs(limit: number, cursor?: string): Promise<Page<Job>> {
  const rows = await prisma.job.findMany({ where: { isOpen: true }, ...cursorArgs(limit, cursor) });
  return toPage(rows, limit);
}

// Admin view: every position, open or closed, newest first.
export async function listAllJobs(limit: number, cursor?: string): Promise<Page<Job>> {
  const rows = await prisma.job.findMany({ ...cursorArgs(limit, cursor) });
  return toPage(rows, limit);
}
