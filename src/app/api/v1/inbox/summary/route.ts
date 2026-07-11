import { route, ok } from "@/server/http/respond";
import { requireAuth } from "@/server/auth/session";
import { inboxSummary } from "@/server/inbox/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Combined unread counts for the header bell (notifications + chat).
export const GET = route(async (req) => {
  const claims = await requireAuth(req);
  const summary = await inboxSummary(claims.sub, claims.role);
  return ok(summary);
});
