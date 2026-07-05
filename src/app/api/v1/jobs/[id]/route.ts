import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { getJob, updateJob, deleteJob } from "@/server/jobs/service";
import { toJobDto } from "@/server/jobs/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });
const patchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    location: z.string().max(200).nullable().optional(),
    employmentType: z.string().max(100).nullable().optional(),
    isOpen: z.boolean().optional(),
  })
  .strict();

export const GET = route(async (_req, ctx) => {
  const { id } = idSchema.parse(await ctx.params);
  return ok({ job: toJobDto(await getJob(id)) });
});

export const PATCH = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const patch = patchSchema.parse(await req.json());
  return ok({ job: toJobDto(await updateJob(id, patch)) });
});

// Deletes the position and its applications (schema cascade).
export const DELETE = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  await deleteJob(id);
  return ok({ ok: true });
});
