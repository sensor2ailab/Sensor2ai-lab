import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { addNotification } from "@/server/hires/service";
import { toNotificationDto } from "@/server/hires/dto";
import { broadcastInbox } from "@/server/realtime/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ userId: z.string().uuid() });
const schema = z.object({ body: z.string().trim().min(1).max(2000) }).strict();

// Admin: post a notification to a hired member.
export const POST = route(async (req, ctx) => {
  const claims = await requireAdmin(req);
  const { userId } = idSchema.parse(await ctx.params);
  const { body } = schema.parse(await req.json());
  const notification = await addNotification(userId, body, claims.sub);
  await broadcastInbox();
  return ok({ notification: toNotificationDto(notification) }, { status: 201 });
});
