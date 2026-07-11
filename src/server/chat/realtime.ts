import { broadcast, INBOX_TOPIC } from "@/server/realtime/broadcast";

// Signal a new chat message: the conversation channel (participant view), the admin
// inbox channel, and the global inbox channel (header bell unread badge).
export async function broadcastMessage(conversationId: string): Promise<void> {
  await broadcast([
    { topic: `chat:conv:${conversationId}`, payload: { conversationId } },
    { topic: "chat:admin", payload: { conversationId } },
    { topic: INBOX_TOPIC },
  ]);
}
