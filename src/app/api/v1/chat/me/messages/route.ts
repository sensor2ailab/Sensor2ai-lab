import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAuth } from "@/server/auth/session";
import { postAsUser } from "@/server/chat/service";
import { broadcastMessage } from "@/server/chat/realtime";
import { toMessageDto } from "@/server/chat/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

// The member sends a message to the admin team.
export const POST = route(async (req) => {
  const claims = await requireAuth(req);
  const { body } = schema.parse(await req.json());
  const { message, conversationId } = await postAsUser(claims.sub, body);
  await broadcastMessage(conversationId);
  return ok({ message: toMessageDto(message) }, { status: 201 });
});
