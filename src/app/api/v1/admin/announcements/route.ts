import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { createAnnouncement, listAllAnnouncements } from "@/server/announcements/service";
import { toAnnouncementDto } from "@/server/announcements/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().min(1),
    link: z.string().url().max(2000).nullish(),
    published: z.boolean().optional(),
  })
  .strict();

// Admin: full list including drafts.
export const GET = route(async (req) => {
  await requireAdmin(req);
  const { limit, cursor } = parsePagination(req.url);
  const page = await listAllAnnouncements(limit, cursor);
  return ok({ items: page.items.map(toAnnouncementDto), nextCursor: page.nextCursor });
});

export const POST = route(async (req) => {
  const claims = await requireAdmin(req);
  const input = createSchema.parse(await req.json());
  const announcement = await createAnnouncement(input, claims.sub);
  return ok({ announcement: toAnnouncementDto(announcement) }, { status: 201 });
});
