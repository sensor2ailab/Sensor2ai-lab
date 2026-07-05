import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { listApplications } from "@/server/applications/service";
import { toApplicationDto } from "@/server/applications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const jobIdSchema = z.string().uuid();
const statusSchema = z.enum(["pending", "approved", "rejected", "withdrawn"]);

export const GET = route(async (req) => {
  await requireAdmin(req);
  const { limit, cursor } = parsePagination(req.url);
  const params = new URL(req.url).searchParams;

  const jobIdResult = jobIdSchema.safeParse(params.get("jobId"));
  const statusResult = statusSchema.safeParse(params.get("status"));

  const page = await listApplications({
    jobId: jobIdResult.success ? jobIdResult.data : undefined,
    status: statusResult.success ? statusResult.data : undefined,
    limit,
    cursor,
  });
  return ok({ items: page.items.map(toApplicationDto), nextCursor: page.nextCursor });
});
