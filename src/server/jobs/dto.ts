import type { Job } from "@prisma/client";

export interface JobDto {
  id: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string | null;
  isOpen: boolean;
  urgent: boolean;
  // Applications awaiting review. Present only on the admin list.
  pendingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export function toJobDto(job: Job & { pendingCount?: number }): JobDto {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    employmentType: job.employmentType,
    isOpen: job.isOpen,
    urgent: job.urgent,
    ...(job.pendingCount !== undefined ? { pendingCount: job.pendingCount } : {}),
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
