import type { Message } from "@prisma/client";

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "admin" | "user";
  body: string;
  createdAt: string;
}

export function toMessageDto(m: Message): MessageDto {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  };
}
