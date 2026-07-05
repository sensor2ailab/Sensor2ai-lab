import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { preview } from "@/server/publications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ rawBibtex: z.string().min(1) }).strict();

// Step 1 of the two-step flow: return a normalized preview the admin can edit.
export const POST = route(async (req) => {
  await requireAdmin(req);
  const { rawBibtex } = schema.parse(await req.json());
  return ok({ preview: preview(rawBibtex) });
});
