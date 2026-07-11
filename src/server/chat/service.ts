import type { Conversation, Message } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";

export async function getOrCreateMyConversation(userId: string): Promise<Conversation> {
  const existing = await prisma.conversation.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.conversation.create({ data: { userId } });
}

export async function listMessages(conversationId: string, limit = 300): Promise<Message[]> {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export interface PostResult {
  message: Message;
  conversationId: string;
}

// A member posts to their own thread (created on first message).
export async function postAsUser(userId: string, body: string): Promise<PostResult> {
  const convo = await getOrCreateMyConversation(userId);
  const message = await prisma.message.create({
    data: { conversationId: convo.id, senderId: userId, senderRole: "user", body },
  });
  await prisma.conversation.update({
    where: { id: convo.id },
    data: { lastMessageAt: message.createdAt, userReadAt: message.createdAt },
  });
  return { message, conversationId: convo.id };
}

// An admin replies into a specific conversation.
export async function postAsAdmin(
  conversationId: string,
  adminId: string,
  body: string,
): Promise<PostResult> {
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) throw Errors.notFound("Conversation not found");
  const message = await prisma.message.create({
    data: { conversationId, senderId: adminId, senderRole: "admin", body },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.createdAt, adminReadAt: message.createdAt },
  });
  return { message, conversationId };
}

export async function markUserRead(userId: string): Promise<void> {
  const convo = await prisma.conversation.findUnique({ where: { userId } });
  if (convo) {
    await prisma.conversation.update({
      where: { id: convo.id },
      data: { userReadAt: new Date() },
    });
  }
}

export async function markAdminRead(conversationId: string): Promise<void> {
  await prisma.conversation
    .update({ where: { id: conversationId }, data: { adminReadAt: new Date() } })
    .catch(() => {
      throw Errors.notFound("Conversation not found");
    });
}

export interface ConversationSummary {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessageAt: string;
  lastMessage: string | null;
  unread: boolean;
}

// Admin inbox: every conversation, newest first, with a preview and an unread flag
// (a member message arrived after the admin last read the thread).
export async function listConversations(): Promise<ConversationSummary[]> {
  const convos = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      user: { select: { fullName: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 200,
  });

  return convos
    .filter((c) => c.messages.length > 0)
    .map((c) => {
      const last = c.messages[0];
      const unread = Boolean(
        last && last.senderRole === "user" && (!c.adminReadAt || last.createdAt > c.adminReadAt),
      );
      return {
        id: c.id,
        userId: c.userId,
        userName: c.user.fullName,
        userEmail: c.user.email,
        lastMessageAt: c.lastMessageAt.toISOString(),
        lastMessage: last?.body ?? null,
        unread,
      };
    });
}
