import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { getApplication } from "@/server/applications/service";
import { toApplicationDto } from "@/server/applications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

export const GET = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const application = await getApplication(id);
  return ok({ application: toApplicationDto(application) });
});
