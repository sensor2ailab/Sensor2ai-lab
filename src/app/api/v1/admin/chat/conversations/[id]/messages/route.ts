import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { listMessages, markAdminRead, postAsAdmin } from "@/server/chat/service";
import { broadcastMessage } from "@/server/chat/realtime";
import { toMessageDto } from "@/server/chat/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });
const schema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

// Admin reads a conversation (and marks it read).
export const GET = route(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const messages = await listMessages(id);
  await markAdminRead(id);
  return ok({ messages: messages.map(toMessageDto) });
});

// Admin replies into a conversation.
export const POST = route(async (req, ctx) => {
  const claims = await requireAdmin(req);
  const { id } = idSchema.parse(await ctx.params);
  const { body } = schema.parse(await req.json());
  const { message, conversationId } = await postAsAdmin(id, claims.sub, body);
  await broadcastMessage(conversationId);
  return ok({ message: toMessageDto(message) }, { status: 201 });
});
