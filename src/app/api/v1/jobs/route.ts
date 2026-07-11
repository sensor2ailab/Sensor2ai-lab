import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { createJob, listOpenJobs } from "@/server/jobs/service";
import { toJobDto } from "@/server/jobs/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    location: z.string().max(200).nullish(),
    employmentType: z.string().max(100).nullish(),
    isOpen: z.boolean().optional(),
    urgent: z.boolean().optional(),
  })
  .strict();

// Public: only open jobs, paginated.
export const GET = route(async (req) => {
  const { limit, cursor } = parsePagination(req.url);
  const page = await listOpenJobs(limit, cursor);
  return ok({ items: page.items.map(toJobDto), nextCursor: page.nextCursor });
});

export const POST = route(async (req) => {
  const claims = await requireAdmin(req);
  const input = createSchema.parse(await req.json());
  const job = await createJob(input, claims.sub);
  return ok({ job: toJobDto(job) }, { status: 201 });
});
