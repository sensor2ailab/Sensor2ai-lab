import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { resetUserPassword } from "@/server/users/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

// Resets the user's password to a fresh temp value and returns the draft the admin
// sends. All of the user's sessions are invalidated.
export const POST = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const { draft } = await resetUserPassword(id);
  return ok({ mailDraft: draft });
});
