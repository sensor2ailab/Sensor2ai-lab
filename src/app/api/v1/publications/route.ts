import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { createPublication, listPublications, preview } from "@/server/publications/service";
import { doiSchema } from "@/server/publications/bibtex";
import { toPublicationDto } from "@/server/publications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z
  .object({
    rawBibtex: z.string().min(1),
    doi: doiSchema.optional(),
    entryType: z.string().nullish(),
    bibtexKey: z.string().nullish(),
    title: z.string().min(1).optional(),
    authors: z.array(z.string()).optional(),
    year: z.number().int().min(1000).max(9999).nullish(),
    venue: z.string().nullish(),
    volume: z.string().nullish(),
    number: z.string().nullish(),
    pages: z.string().nullish(),
    publisher: z.string().nullish(),
    url: z.string().url().nullish(),
    abstract: z.string().nullish(),
  })
  .strict();

// Public, paginated, searchable (?q=), filterable (?year=&type=).
export const GET = route(async (req) => {
  const { limit, cursor } = parsePagination(req.url);
  const params = new URL(req.url).searchParams;
  const yearRaw = params.get("year");
  const year = yearRaw ? Number(yearRaw) : undefined;
  const page = await listPublications({
    q: params.get("q") ?? undefined,
    year: year !== undefined && Number.isFinite(year) ? year : undefined,
    type: params.get("type") ?? undefined,
    limit,
    cursor,
  });
  return ok({ items: page.items.map(toPublicationDto), nextCursor: page.nextCursor });
});

// Admin create (step 2, or direct): parse the BibTeX, apply any edited overrides.
export const POST = route(async (req) => {
  const claims = await requireAdmin(req);
  const body = createSchema.parse(await req.json());
  const parsed = preview(body.rawBibtex);
  const parsedDoi = parsed.doi && doiSchema.safeParse(parsed.doi).success ? parsed.doi : null;

  const pub = await createPublication(
    {
      entryType: body.entryType ?? parsed.entryType,
      bibtexKey: body.bibtexKey ?? parsed.bibtexKey,
      title: body.title ?? parsed.title,
      authors: body.authors ?? parsed.authors,
      year: body.year ?? parsed.year,
      venue: body.venue ?? parsed.venue,
      volume: body.volume ?? parsed.volume,
      number: body.number ?? parsed.number,
      pages: body.pages ?? parsed.pages,
      publisher: body.publisher ?? parsed.publisher,
      doi: body.doi ?? parsedDoi,
      url: body.url ?? parsed.url,
      abstract: body.abstract ?? parsed.abstract,
      rawBibtex: body.rawBibtex,
    },
    claims.sub,
  );
  return ok({ publication: toPublicationDto(pub) }, { status: 201 });
});
