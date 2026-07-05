import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { clientMeta } from "@/server/http/request";
import { approveApplication } from "@/server/applications/service";
import { toApplicationDto } from "@/server/applications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });
// tempPassword is the value emailed in the draft step (required for a new account,
// omitted when the applicant already has one).
const bodySchema = z.object({ tempPassword: z.string().min(1).nullish() }).strict();

// Step 2 of approval: commit. The admin calls this only after sending the welcome
// email, so the applicant's credentials are live the moment they are approved.
export const POST = route(async (req, ctx) => {
  const claims = await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const { ip } = clientMeta(req);
  const body = bodySchema.parse(await req.json().catch(() => ({})));
  const result = await approveApplication(id, claims.sub, body.tempPassword ?? null, ip);
  return ok({
    application: toApplicationDto(result.application),
    userId: result.userId,
    createdUser: result.created,
  });
});
