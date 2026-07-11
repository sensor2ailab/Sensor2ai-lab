import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { setMeetingForMany } from "@/server/hires/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    userIds: z.array(z.string().uuid()).min(1).max(500),
    lastMeetingAt: z.string().datetime().nullable(),
  })
  .strict();

// Admin: set the same last-meeting date on many hired members at once (multi-update).
export const POST = route(async (req) => {
  await requireAdmin(req);
  const { userIds, lastMeetingAt } = schema.parse(await req.json());
  const updated = await setMeetingForMany(userIds, lastMeetingAt ? new Date(lastMeetingAt) : null);
  return ok({ updated });
});
