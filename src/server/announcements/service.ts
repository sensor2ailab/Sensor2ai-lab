import type { Announcement } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { cursorArgs, toPage, type Page } from "@/server/http/pagination";
import { notifyAllHired } from "@/server/hires/service";
import { broadcastInbox } from "@/server/realtime/broadcast";

// When an announcement goes live, drop a notification into every hired member's inbox
// and ping the realtime inbox channel so their header bell updates immediately.
async function announceToHired(title: string, createdBy: string | null): Promise<void> {
  const count = await notifyAllHired(`New announcement: ${title}`, createdBy);
  if (count > 0) await broadcastInbox();
}

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
  const announcement = await prisma.announcement.create({
    data: {
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      published,
      publishedAt: published ? new Date() : null,
      createdBy,
    },
  });
  if (published) await announceToHired(announcement.title, createdBy);
  return announcement;
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
  let nowPublishing = false;
  if (patch.published !== undefined && patch.published !== current.published) {
    data.published = patch.published;
    data.publishedAt = patch.published ? new Date() : null;
    nowPublishing = patch.published;
  }
  const updated = await prisma.announcement.update({ where: { id }, data });
  if (nowPublishing) await announceToHired(updated.title, current.createdBy);
  return updated;
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
