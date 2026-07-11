import type { Notification } from "@prisma/client";
import type { HireRecord } from "./service";

export interface NotificationDto {
  id: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface HireDto {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  collegeName: string | null;
  lastMeetingAt: string | null;
  active: boolean;
  jobTitles: string[];
  notifications: NotificationDto[];
}

export function toNotificationDto(n: Notification): NotificationDto {
  return {
    id: n.id,
    body: n.body,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

export function toHireDto(rec: HireRecord): HireDto {
  return {
    userId: rec.user.id,
    name: rec.user.fullName,
    email: rec.user.email,
    phone: rec.user.phone,
    collegeName: rec.user.collegeName,
    lastMeetingAt: rec.user.lastMeetingAt?.toISOString() ?? null,
    active: rec.user.isActive,
    jobTitles: rec.jobTitles,
    notifications: rec.notifications.map(toNotificationDto),
  };
}
