import { route, ok } from "@/server/http/respond";
import { requireAuth } from "@/server/auth/session";
import { listMyNotifications, markAllRead } from "@/server/hires/service";
import { toNotificationDto } from "@/server/hires/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The signed-in member's own notifications.
export const GET = route(async (req) => {
  const claims = await requireAuth(req);
  const items = await listMyNotifications(claims.sub);
  return ok({ items: items.map(toNotificationDto) });
});

// Mark all of the member's notifications as read.
export const POST = route(async (req) => {
  const claims = await requireAuth(req);
  const read = await markAllRead(claims.sub);
  return ok({ read });
});
