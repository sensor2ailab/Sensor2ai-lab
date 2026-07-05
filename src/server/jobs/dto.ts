import type { Job } from "@prisma/client";

export interface JobDto {
  id: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toJobDto(job: Job): JobDto {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    employmentType: job.employmentType,
    isOpen: job.isOpen,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
