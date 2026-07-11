import { route, ok } from "@/server/http/respond";
import { requireAuth } from "@/server/auth/session";
import { getOrCreateMyConversation, listMessages, markUserRead } from "@/server/chat/service";
import { toMessageDto } from "@/server/chat/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The signed-in member's own conversation with the admin team (created on demand).
export const GET = route(async (req) => {
  const claims = await requireAuth(req);
  const convo = await getOrCreateMyConversation(claims.sub);
  const messages = await listMessages(convo.id);
  await markUserRead(claims.sub);
  return ok({ conversationId: convo.id, messages: messages.map(toMessageDto) });
});
