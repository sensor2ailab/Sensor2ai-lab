import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import {
  getPublication,
  updatePublication,
  deletePublication,
} from "@/server/publications/service";
import { doiSchema } from "@/server/publications/bibtex";
import { toPublicationDto } from "@/server/publications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });

const patchSchema = z
  .object({
    entryType: z.string().nullable().optional(),
    bibtexKey: z.string().nullable().optional(),
    title: z.string().min(1).optional(),
    authors: z.array(z.string()).optional(),
    year: z.number().int().min(1000).max(9999).nullable().optional(),
    venue: z.string().nullable().optional(),
    volume: z.string().nullable().optional(),
    number: z.string().nullable().optional(),
    pages: z.string().nullable().optional(),
    publisher: z.string().nullable().optional(),
    doi: doiSchema.nullable().optional(),
    url: z.string().url().nullable().optional(),
    abstract: z.string().nullable().optional(),
    rawBibtex: z.string().min(1).optional(),
  })
  .strict();

export const GET = route(async (_req, ctx) => {
  const { id } = idSchema.parse(await ctx.params);
  return ok({ publication: toPublicationDto(await getPublication(id)) });
});

export const PATCH = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const patch = patchSchema.parse(await req.json());
  return ok({ publication: toPublicationDto(await updatePublication(id, patch)) });
});

export const DELETE = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  await deletePublication(id);
  return ok({ ok: true });
});
