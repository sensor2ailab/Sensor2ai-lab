import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import {
  getOrCreateMyConversation,
  listMessages,
  markAdminRead,
  postAsAdmin,
} from "@/server/chat/service";
import { broadcastMessage } from "@/server/chat/realtime";
import { toMessageDto } from "@/server/chat/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ userId: z.string().uuid() });
const bodySchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

// Admin: the conversation with a hired member (created on demand). Reading it marks
// the admin side read.
export const GET = route(async (req, ctx) => {
  await requireAdmin(req);
  const { userId } = idSchema.parse(await ctx.params);
  const convo = await getOrCreateMyConversation(userId);
  const messages = await listMessages(convo.id);
  await markAdminRead(convo.id);
  return ok({ conversationId: convo.id, messages: messages.map(toMessageDto) });
});

// Admin sends a message straight into the member's chat (not a one-off notification),
// so it lands in their conversation and pings realtime/inbox.
export const POST = route(async (req, ctx) => {
  const claims = await requireAdmin(req);
  const { userId } = idSchema.parse(await ctx.params);
  const { body } = bodySchema.parse(await req.json());
  const convo = await getOrCreateMyConversation(userId);
  const { message } = await postAsAdmin(convo.id, claims.sub, body);
  await broadcastMessage(convo.id);
  return ok({ message: toMessageDto(message) }, { status: 201 });
});
