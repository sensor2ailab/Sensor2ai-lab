import type { Notification, User } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { updateUser } from "@/server/users/service";

// A "hired" member is a user account created/linked through an approved application.
export interface HireRecord {
  user: User;
  jobTitles: string[];
  notifications: Notification[];
}

// Hired members are users stamped with `hiredAt` (set on approval). Positions come
// from any surviving approved applications therefore a deleted job posting no longer removes
// the member, it just leaves their position list empty.
export async function listHires(): Promise<HireRecord[]> {
  const users = await prisma.user.findMany({
    where: { hiredAt: { not: null } },
    orderBy: { hiredAt: "desc" },
    include: {
      notifications: { orderBy: { createdAt: "desc" } },
      createdApplications: {
        where: { status: "approved" },
        include: { job: { select: { title: true } } },
      },
    },
  });

  return users.map((user) => {
    const jobTitles: string[] = [];
    for (const app of user.createdApplications) {
      const title = app.job?.title;
      if (title && !jobTitles.includes(title)) jobTitles.push(title);
    }
    return { user, jobTitles, notifications: user.notifications };
  });
}

async function assertHiredUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hiredAt: true },
  });
  if (!user?.hiredAt) throw Errors.notFound("Hired member not found");
}

export interface UpdateHireInput {
  collegeName?: string | null;
  lastMeetingAt?: Date | null;
}

export async function updateHire(userId: string, patch: UpdateHireInput): Promise<User> {
  await assertHiredUser(userId);
  return prisma.user.update({ where: { id: userId }, data: { ...patch } });
}

// Revoke or restore a hired member's login. Revoking (active=false) also invalidates
// their current sessions and refresh tokens (handled by updateUser), so a member who
// has finished their term is signed out immediately and can no longer sign in.
export async function setHireAccess(userId: string, active: boolean): Promise<User> {
  await assertHiredUser(userId);
  return updateUser(userId, { isActive: active });
}

// Bulk "last meeting" update for the multi-select toolbar. Scoped to genuine hired
// users so an arbitrary id list can't touch admin/other accounts.
export async function setMeetingForMany(
  userIds: string[],
  lastMeetingAt: Date | null,
): Promise<number> {
  // Scoped to genuine hired members, so an arbitrary id list can't touch other accounts.
  const res = await prisma.user.updateMany({
    where: { id: { in: userIds }, hiredAt: { not: null } },
    data: { lastMeetingAt },
  });
  return res.count;
}

export async function addNotification(
  userId: string,
  body: string,
  createdBy: string,
): Promise<Notification> {
  await assertHiredUser(userId);
  return prisma.notification.create({ data: { userId, body, createdBy } });
}

// Fan out a notification to every hired member (e.g. when an announcement goes live).
// Returns how many members were notified.
export async function notifyAllHired(body: string, createdBy: string | null): Promise<number> {
  const rows = await prisma.user.findMany({
    where: { hiredAt: { not: null } },
    select: { id: true },
  });
  if (rows.length === 0) return 0;
  await prisma.notification.createMany({
    data: rows.map((r) => ({ userId: r.id, body, createdBy })),
  });
  return rows.length;
}

export async function deleteNotification(id: string): Promise<void> {
  await prisma.notification.delete({ where: { id } }).catch(() => {
    throw Errors.notFound("Notification not found");
  });
}

// User-facing: a member's own notifications, and a mark-all-read helper.
export async function listMyNotifications(userId: string): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markAllRead(userId: string): Promise<number> {
  const res = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return res.count;
}

// Mark a single notification read. Scoped by userId so a member can only ever mark
// their own; already-read rows are a no-op.
export async function markNotificationRead(userId: string, id: string): Promise<number> {
  const res = await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  return res.count;
}
