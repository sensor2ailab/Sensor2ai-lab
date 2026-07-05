import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { updateUser } from "@/server/users/service";
import { toPublicUser } from "@/server/users/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });
const patchSchema = z
  .object({
    fullName: z.string().min(1).max(200).optional(),
    phone: z.string().max(40).nullable().optional(),
    role: z.enum(["admin", "user"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const PATCH = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const patch = patchSchema.parse(await req.json());
  const user = await updateUser(id, patch);
  return ok({ user: toPublicUser(user) });
});
