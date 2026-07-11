import { route, ok } from "@/server/http/respond";
import { listAllTags } from "@/server/publications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public: every distinct tag across all publications (for the filter row).
export const GET = route(async () => {
  return ok({ tags: await listAllTags() });
});
