import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { updateAnnouncement, deleteAnnouncement } from "@/server/announcements/service";
import { toAnnouncementDto } from "@/server/announcements/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });
const patchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().min(1).optional(),
    link: z.string().url().max(2000).nullish(),
    published: z.boolean().optional(),
  })
  .strict();

export const PATCH = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const patch = patchSchema.parse(await req.json());
  const announcement = await updateAnnouncement(id, patch);
  return ok({ announcement: toAnnouncementDto(announcement) });
});

export const DELETE = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  await deleteAnnouncement(id);
  return ok({ ok: true });
});
