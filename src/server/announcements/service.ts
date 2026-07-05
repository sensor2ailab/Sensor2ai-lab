import type { Announcement } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { cursorArgs, toPage, type Page } from "@/server/http/pagination";

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  link?: string | null;
  published?: boolean;
}

// Publishing stamps publishedAt once; unpublishing clears it so a later
// re-publish reflects the new date.
export async function createAnnouncement(
  input: CreateAnnouncementInput,
  createdBy: string,
): Promise<Announcement> {
  const published = input.published ?? false;
  return prisma.announcement.create({
    data: {
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      published,
      publishedAt: published ? new Date() : null,
      createdBy,
    },
  });
}

export interface UpdateAnnouncementInput {
  title?: string;
  body?: string;
  link?: string | null;
  published?: boolean;
}

export async function updateAnnouncement(
  id: string,
  patch: UpdateAnnouncementInput,
): Promise<Announcement> {
  const current = await prisma.announcement.findUnique({ where: { id } });
  if (!current) throw Errors.notFound("Announcement not found");

  const data: Record<string, unknown> = {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.body !== undefined ? { body: patch.body } : {}),
    ...(patch.link !== undefined ? { link: patch.link } : {}),
  };
  if (patch.published !== undefined && patch.published !== current.published) {
    data.published = patch.published;
    data.publishedAt = patch.published ? new Date() : null;
  }
  return prisma.announcement.update({ where: { id }, data });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const current = await prisma.announcement.findUnique({ where: { id } });
  if (!current) throw Errors.notFound("Announcement not found");
  await prisma.announcement.delete({ where: { id } });
}

// Admin view: everything, newest first (drafts included).
export async function listAllAnnouncements(
  limit: number,
  cursor?: string,
): Promise<Page<Announcement>> {
  const rows = await prisma.announcement.findMany({ ...cursorArgs(limit, cursor) });
  return toPage(rows, limit);
}

// Public view: published only, most recently published first.
export async function listPublishedAnnouncements(
  limit: number,
  cursor?: string,
): Promise<Page<Announcement>> {
  const rows = await prisma.announcement.findMany({
    where: { published: true },
    ...cursorArgs(limit, cursor),
  });
  return toPage(rows, limit);
}
