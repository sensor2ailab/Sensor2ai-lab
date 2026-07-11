import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { deleteNotification } from "@/server/hires/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

// Admin: remove a notification previously sent to a hired member.
export const DELETE = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  await deleteNotification(id);
  return ok({ ok: true });
});
