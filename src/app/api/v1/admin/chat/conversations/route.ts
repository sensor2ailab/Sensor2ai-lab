import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { listConversations } from "@/server/chat/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin inbox: all member conversations, newest first, with unread flags.
export const GET = route(async (req) => {
  await requireAdmin(req);
  return ok({ items: await listConversations() });
});
