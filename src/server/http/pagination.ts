import { z } from "zod";

// Cursor pagination shared by all list endpoints. The cursor is simply the id of
// the last row; results are ordered by (createdAt desc, id desc) for stability.
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export function parsePagination(url: string): { limit: number; cursor?: string } {
  const params = new URL(url).searchParams;
  return paginationSchema.parse({
    limit: params.get("limit") ?? undefined,
    cursor: params.get("cursor") ?? undefined,
  });
}

// Prisma args for `(createdAt desc, id desc)` cursor paging. Fetch limit+1 to know
// whether another page exists, then trim.
export function cursorArgs(limit: number, cursor?: string) {
  return {
    take: limit + 1,
    orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  };
}

export function toPage<T extends { id: string }>(rows: T[], limit: number): Page<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
}
