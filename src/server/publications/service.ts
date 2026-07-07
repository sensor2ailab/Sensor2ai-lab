import { Prisma, type Publication } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { cursorArgs, toPage, type Page } from "@/server/http/pagination";
import { parseBibtex, type ParsedPublication } from "./bibtex";

export function preview(raw: string): ParsedPublication {
  return parseBibtex(raw);
}

export interface PublicationData {
  entryType: string | null;
  bibtexKey: string | null;
  title: string;
  authors: string[];
  tags: string[];
  year: number | null;
  venue: string | null;
  volume: string | null;
  number: string | null;
  pages: string | null;
  publisher: string | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  rawBibtex: string;
}

async function assertUnique(doi: string | null, bibtexKey: string | null, excludeId?: string) {
  if (doi) {
    const dupe = await prisma.publication.findFirst({
      where: { doi, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (dupe) throw Errors.conflict("A publication with this DOI already exists");
  }
  if (bibtexKey) {
    const dupe = await prisma.publication.findFirst({
      where: { bibtexKey, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (dupe) throw Errors.conflict("A publication with this BibTeX key already exists");
  }
}

export async function createPublication(
  data: PublicationData,
  createdBy: string,
): Promise<Publication> {
  await assertUnique(data.doi, data.bibtexKey);
  return prisma.publication.create({
    data: { ...data, authors: data.authors, tags: data.tags, createdBy },
  });
}

export async function getPublication(id: string): Promise<Publication> {
  const pub = await prisma.publication.findUnique({ where: { id } });
  if (!pub) throw Errors.notFound("Publication not found");
  return pub;
}

export async function updatePublication(
  id: string,
  patch: Partial<PublicationData>,
): Promise<Publication> {
  await getPublication(id);
  await assertUnique(patch.doi ?? null, patch.bibtexKey ?? null, id);
  const data: Prisma.PublicationUpdateInput = {
    ...patch,
    ...(patch.authors ? { authors: patch.authors } : {}),
    ...(patch.tags ? { tags: patch.tags } : {}),
  };
  return prisma.publication.update({ where: { id }, data });
}

export async function deletePublication(id: string): Promise<void> {
  await getPublication(id);
  await prisma.publication.delete({ where: { id } });
}

export interface ListParams {
  q?: string;
  year?: number;
  type?: string;
  limit: number;
  cursor?: string;
}

// Full-text search path: rank/filter via raw SQL to get an ordered page of ids,
// then hydrate through Prisma so the mapped rows stay type-safe.
async function searchIds(p: ListParams): Promise<string[]> {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`search_tsv @@ websearch_to_tsquery('english', ${p.q})`,
  ];
  if (p.year) conditions.push(Prisma.sql`year = ${p.year}`);
  if (p.type) conditions.push(Prisma.sql`entry_type = ${p.type}`);
  if (p.cursor) {
    conditions.push(
      Prisma.sql`(created_at, id) < (SELECT created_at, id FROM publications WHERE id = ${p.cursor}::uuid)`,
    );
  }
  const rows = await prisma.$queryRaw<{ id: string }[]>(
    Prisma.sql`SELECT id FROM publications WHERE ${Prisma.join(conditions, " AND ")} ORDER BY created_at DESC, id DESC LIMIT ${p.limit + 1}`,
  );
  return rows.map((r) => r.id);
}

export async function listPublications(p: ListParams): Promise<Page<Publication>> {
  if (!p.q) {
    const where: Prisma.PublicationWhereInput = {
      ...(p.year ? { year: p.year } : {}),
      ...(p.type ? { entryType: p.type } : {}),
    };
    const rows = await prisma.publication.findMany({ where, ...cursorArgs(p.limit, p.cursor) });
    return toPage(rows, p.limit);
  }

  const ids = await searchIds(p);
  const hasMore = ids.length > p.limit;
  const pageIds = hasMore ? ids.slice(0, p.limit) : ids;
  if (pageIds.length === 0) return { items: [], nextCursor: null };

  const rows = await prisma.publication.findMany({ where: { id: { in: pageIds } } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const items = pageIds.map((id) => byId.get(id)).filter((r): r is Publication => Boolean(r));
  return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
}
