import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAuth } from "@/server/auth/session";
import { markNotificationRead } from "@/server/hires/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

// Mark one of the member's notifications read (used when they click it in the inbox).
export const POST = route(async (req, ctx) => {
  const claims = await requireAuth(req);
  const { id } = idSchema.parse(await ctx.params);
  const read = await markNotificationRead(claims.sub, id);
  return ok({ read });
});
