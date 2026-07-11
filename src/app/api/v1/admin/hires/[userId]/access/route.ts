import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { setHireAccess } from "@/server/hires/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ userId: z.string().uuid() });
const schema = z.object({ active: z.boolean() }).strict();

// Admin: revoke (active:false) or restore (active:true) a hired member's login.
// Revoking signs them out everywhere and blocks future sign-ins.
export const PATCH = route(async (req, ctx) => {
  await requireAdmin(req);
  const { userId } = idSchema.parse(await ctx.params);
  const { active } = schema.parse(await req.json());
  const user = await setHireAccess(userId, active);
  return ok({ userId: user.id, active: user.isActive });
});
