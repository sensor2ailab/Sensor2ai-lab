import type { Announcement } from "@prisma/client";

export interface AnnouncementDto {
  id: string;
  title: string;
  body: string;
  link: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toAnnouncementDto(a: Announcement): AnnouncementDto {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    link: a.link,
    published: a.published,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
