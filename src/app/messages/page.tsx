"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Inbox, Loader2, Megaphone, MessagesSquare, Reply, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ChatThread } from "@/components/chat/ChatThread";
import { ChatBento } from "@/components/chat/ChatBento";
import {
  ChatThreadSkeleton,
  ChatListSkeleton,
  ChatBentoSkeleton,
} from "@/components/chat/ChatSkeleton";
import { RevealHeading } from "@/components/ui/RevealHeading";
import { useLiveSync } from "@/lib/use-live-sync";
import { errorFromResponse } from "@/lib/api-error";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { ChatConversation, ChatMessage } from "@/lib/api-types";

export default function MessagesPage() {
  const router = useRouter();
  const { status, isAdmin } = useAuth();

  useEffect(() => {
    if (status === "anon") router.replace("/login?next=/messages");
  }, [status, router]);

  if (status === "loading" || status === "anon") {
    return (
      <Section tone="surface" className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted size-6 animate-spin" aria-hidden="true" />
      </Section>
    );
  }

  return isAdmin ? <AdminChat /> : <MemberChat />;
}

// ── Member view: a single conversation with the admin team ────────────────────
function MemberChat() {
  const { authFetch } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await authFetch("/chat/me");
    if (!res.ok) return;
    const body = (await res.json()) as { conversationId: string; messages: ChatMessage[] };
    setConversationId(body.conversationId);
    setMessages(body.messages);
  }, [authFetch]);

  useEffect(() => {
    let active = true;
    (async () => {
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load]);

  useLiveSync(conversationId ? `chat:conv:${conversationId}` : null, () => void load());

  async function send(text: string) {
    setSending(true);
    try {
      const res = await authFetch("/chat/me/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const { message } = (await res.json()) as { message: ChatMessage };
      setConversationId(message.conversationId);
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Section tone="surface" className="min-h-[70vh]">
      <Container className="flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span
            data-reveal
            suppressHydrationWarning
            className="text-primary text-xs font-semibold tracking-[0.2em] uppercase"
          >
            Messages
          </span>
          <RevealHeading text="Ask the team" className="text-[clamp(1.5rem,4vw,2.25rem)]" />
          <p className="text-secondary text-sm">
            Questions about your application, projects, or a meeting? Message the admins here.
          </p>
        </div>

        {loading ? (
          <ChatBentoSkeleton />
        ) : (
          <ChatBento
            tiles={[
              {
                id: "messages",
                label: "Messages",
                value: messages.length,
                icon: MessagesSquare,
              },
              {
                id: "replies",
                label: "Team replies",
                value: messages.filter((msg) => msg.senderRole === "admin").length,
                icon: Reply,
              },
              {
                id: "inbox",
                label: "Inbox",
                hint: "Notices & updates",
                icon: Inbox,
                href: "/inbox",
              },
              {
                id: "announcements",
                label: "Announcements",
                hint: "Lab-wide notices",
                icon: Megaphone,
                href: "/announcements",
              },
            ]}
          />
        )}

        <div className="border-border bg-background flex h-[62vh] flex-col overflow-hidden rounded-lg border">
          {loading ? (
            <ChatThreadSkeleton />
          ) : (
            <ChatThread
              messages={messages}
              viewerRole="user"
              onSend={send}
              sending={sending}
              emptyHint="No messages yet. Say hello 👋"
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

// ── Admin view: inbox of conversations + the selected thread ──────────────────
function AdminChat() {
  const { authFetch } = useAuth();
  const reduce = useReducedMotion();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Which conversation the loaded messages belong to. The thread is keyed on this
  // (not on selectedId), so switching keeps the previous thread on screen until the
  // new one has arrived and then cross-fades, so there is no flash of an empty pane.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    const res = await authFetch("/admin/chat/conversations");
    if (!res.ok) return;
    const body = (await res.json()) as { items: ChatConversation[] };
    setConversations(body.items);
    setSelectedId((prev) => prev ?? body.items[0]?.id ?? null);
  }, [authFetch]);

  const loadMessages = useCallback(
    async (id: string) => {
      const res = await authFetch(`/admin/chat/conversations/${id}/messages`);
      if (!res.ok) return;
      const body = (await res.json()) as { messages: ChatMessage[] };
      setMessages(body.messages);
      setLoadedFor(id);
    },
    [authFetch],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      await loadConversations();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      await loadMessages(selectedId);
    })();
  }, [selectedId, loadMessages]);

  // Realtime/poll: refresh the inbox on any ping; refresh the open thread too.
  useLiveSync("chat:admin", () => {
    void loadConversations();
    if (selectedId) void loadMessages(selectedId);
  });

  async function send(text: string) {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await authFetch(`/admin/chat/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const { message } = (await res.json()) as { message: ChatMessage };
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      void loadConversations();
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setSending(false);
    }
  }

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const awaiting = conversations.filter((c) => c.unread).length;
  // True from the moment a new conversation is picked until its messages arrive, so the
  // thread shows a skeleton while switching rather than the previous conversation.
  const switching = selectedId !== null && selectedId !== loadedFor;

  return (
    <Section tone="surface" className="min-h-[70vh]">
      <Container className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span
            data-reveal
            suppressHydrationWarning
            className="text-primary text-xs font-semibold tracking-[0.2em] uppercase"
          >
            Administration
          </span>
          <RevealHeading text="Messages" className="text-[clamp(1.5rem,4vw,2.25rem)]" />
        </div>

        {loading ? (
          <>
            <ChatBentoSkeleton />
            <div className="border-border grid h-[68vh] grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-[18rem_1fr]">
              <div className="border-border thin-scroll hidden overflow-y-auto border-r sm:block">
                <ChatListSkeleton />
              </div>
              <div className="min-h-0">
                <ChatThreadSkeleton />
              </div>
            </div>
          </>
        ) : conversations.length === 0 ? (
          <div className="border-border text-secondary flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <MessagesSquare className="text-muted size-8" aria-hidden="true" />
            <p>No conversations yet. Members can start one from their Messages page.</p>
          </div>
        ) : (
          <>
            <ChatBento
              tiles={[
                {
                  id: "conversations",
                  label: "Conversations",
                  value: conversations.length,
                  icon: MessagesSquare,
                },
                {
                  id: "awaiting",
                  label: "Awaiting reply",
                  value: awaiting,
                  icon: Reply,
                  accent: awaiting > 0,
                },
                {
                  id: "thread",
                  label: "In this thread",
                  value: messages.length,
                  icon: Inbox,
                },
                {
                  id: "hired",
                  label: "Hired members",
                  hint: "Manage meetings & notices",
                  icon: Users,
                  href: "/admin/hired",
                },
              ]}
            />

            <div className="border-border grid h-[68vh] grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-[18rem_1fr]">
              {/* Inbox */}
              <ul className="border-border thin-scroll hidden overflow-y-auto border-r sm:block">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      aria-current={c.id === selectedId}
                      className={cn(
                        "border-border/70 relative flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left",
                        c.id !== selectedId &&
                          "hover:bg-surface-2 transition-colors duration-(--dur-fast)",
                      )}
                    >
                      {/* The active highlight is a single shared element, so it glides
                          between rows instead of snapping on/off. */}
                      {c.id === selectedId ? (
                        <m.span
                          layoutId="conv-active"
                          aria-hidden="true"
                          className="bg-primary-soft/70 border-primary absolute inset-0 border-l-2"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 420, damping: 38 }
                          }
                        />
                      ) : null}
                      <span className="relative flex items-center gap-2">
                        <span className="text-foreground truncate text-sm font-medium">
                          {c.userName}
                        </span>
                        {c.unread ? (
                          <span
                            className="bg-accent size-2 shrink-0 rounded-full"
                            aria-label="unread"
                          />
                        ) : null}
                      </span>
                      <span className="text-muted relative truncate text-xs">
                        {c.lastMessage ?? "No messages yet"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Thread */}
              <div className="flex min-h-0 flex-col">
                {selected ? (
                  <>
                    <div className="border-border bg-surface-2/40 border-b px-4 py-3">
                      <p className="text-foreground text-sm font-semibold">{selected.userName}</p>
                      <p className="text-muted text-xs">{selected.userEmail}</p>
                    </div>
                    {/* Mobile conversation switcher */}
                    <div className="border-border block border-b p-2 sm:hidden">
                      <select
                        value={selectedId ?? ""}
                        onChange={(e) => setSelectedId(e.target.value)}
                        aria-label="Select conversation"
                        className="border-border bg-background w-full rounded-md border px-2 py-1.5 text-sm"
                      >
                        {conversations.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.userName}
                            {c.unread ? " •" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-h-0 flex-1">
                      <AnimatePresence mode="wait" initial={false}>
                        {switching ? (
                          <m.div
                            key={`skeleton-${selectedId}`}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                            transition={{ duration: reduce ? 0 : 0.18, ease: easeOut }}
                            className="h-full"
                          >
                            <ChatThreadSkeleton />
                          </m.div>
                        ) : (
                          <m.div
                            key={loadedFor ?? "empty"}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                            transition={{ duration: reduce ? 0 : 0.18, ease: easeOut }}
                            className="h-full"
                          >
                            <ChatThread
                              messages={messages}
                              viewerRole="admin"
                              onSend={send}
                              sending={sending}
                              emptyHint="No messages in this conversation yet."
                            />
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="text-muted flex flex-1 items-center justify-center text-sm">
                    Select a conversation
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
