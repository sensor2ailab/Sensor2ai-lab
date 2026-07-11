import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { updateHire } from "@/server/hires/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ userId: z.string().uuid() });
const patchSchema = z
  .object({
    collegeName: z.string().max(200).nullable().optional(),
    lastMeetingAt: z.string().datetime().nullable().optional(),
  })
  .strict();

// Admin: edit one hired member's college and/or last-meeting date.
export const PATCH = route(async (req, ctx) => {
  await requireAdmin(req);
  const { userId } = idSchema.parse(await ctx.params);
  const body = patchSchema.parse(await req.json());

  const user = await updateHire(userId, {
    ...(body.collegeName !== undefined
      ? { collegeName: body.collegeName?.trim() ? body.collegeName.trim() : null }
      : {}),
    ...(body.lastMeetingAt !== undefined
      ? { lastMeetingAt: body.lastMeetingAt ? new Date(body.lastMeetingAt) : null }
      : {}),
  });

  return ok({
    userId: user.id,
    collegeName: user.collegeName,
    lastMeetingAt: user.lastMeetingAt?.toISOString() ?? null,
  });
});
