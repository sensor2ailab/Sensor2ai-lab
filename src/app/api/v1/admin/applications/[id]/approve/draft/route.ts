import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { prepareApproval } from "@/server/applications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

// Step 1 of approval: return the welcome mail draft (with fresh credentials) that
// the admin sends. Nothing is committed until /approve is called.
export const POST = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const { draft, tempPassword, existingUser } = await prepareApproval(id);
  return ok({ mailDraft: draft, tempPassword, existingUser });
});
