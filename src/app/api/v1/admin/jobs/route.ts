import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { listAllJobs } from "@/server/jobs/service";
import { toJobDto } from "@/server/jobs/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin: full list including closed positions.
export const GET = route(async (req) => {
  await requireAdmin(req);
  const { limit, cursor } = parsePagination(req.url);
  const page = await listAllJobs(limit, cursor);
  return ok({ items: page.items.map(toJobDto), nextCursor: page.nextCursor });
});
