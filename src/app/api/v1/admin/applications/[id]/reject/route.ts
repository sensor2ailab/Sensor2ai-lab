import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { clientMeta } from "@/server/http/request";
import { rejectApplication } from "@/server/applications/service";
import { toApplicationDto } from "@/server/applications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

// Simple reject: mark the application rejected. No email.
export const POST = route(async (req, ctx) => {
  const claims = await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const { ip } = clientMeta(req);
  const application = await rejectApplication(id, claims.sub, ip);
  return ok({ application: toApplicationDto(application) });
});
