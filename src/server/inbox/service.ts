import { prisma } from "@/server/db/prisma";

export interface InboxSummary {
  notificationsUnread: number;
  messagesUnread: number;
  total: number;
  // The member's own conversation id (for realtime subscription); null for admins.
  conversationId: string | null;
}

// Combined unread counts for the header bell: notifications + chat messages.
// Admins count unread conversations (a member message after they last read it);
// members count admin messages sent after they last read their thread.
export async function inboxSummary(userId: string, role: "admin" | "user"): Promise<InboxSummary> {
  const notificationsUnread = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  let messagesUnread = 0;
  let conversationId: string | null = null;

  if (role === "admin") {
    const convos = await prisma.conversation.findMany({
      select: { adminReadAt: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    for (const c of convos) {
      const last = c.messages[0];
      if (
        last &&
        last.senderRole === "user" &&
        (!c.adminReadAt || last.createdAt > c.adminReadAt)
      ) {
        messagesUnread += 1;
      }
    }
  } else {
    const convo = await prisma.conversation.findUnique({ where: { userId } });
    if (convo) {
      conversationId = convo.id;
      messagesUnread = await prisma.message.count({
        where: {
          conversationId: convo.id,
          senderRole: "admin",
          ...(convo.userReadAt ? { createdAt: { gt: convo.userReadAt } } : {}),
        },
      });
    }
  }

  return {
    notificationsUnread,
    messagesUnread,
    total: notificationsUnread + messagesUnread,
    conversationId,
  };
}
