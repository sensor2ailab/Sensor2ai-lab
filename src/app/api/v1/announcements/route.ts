import { route, ok } from "@/server/http/respond";
import { requireAuth } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { listPublishedAnnouncements } from "@/server/announcements/service";
import { toAnnouncementDto } from "@/server/announcements/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Authenticated users only: published announcements, most recent first.
export const GET = route(async (req) => {
  await requireAuth(req);
  const { limit, cursor } = parsePagination(req.url);
  const page = await listPublishedAnnouncements(limit, cursor);
  return ok({ items: page.items.map(toAnnouncementDto), nextCursor: page.nextCursor });
});
