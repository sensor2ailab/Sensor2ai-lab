"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Bell, CheckCheck, Loader2, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertSettings } from "@/components/layout/AlertSettings";
import { RevealHeading } from "@/components/ui/RevealHeading";
import { useLiveSync } from "@/lib/use-live-sync";
import { pingInboxLocal } from "@/lib/inbox-events";
import { errorFromResponse } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ChatConversation, ChatMessage, Notification } from "@/lib/api-types";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export default function InboxPage() {
  const router = useRouter();
  const { status, isAdmin, authFetch } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    const reqs: Promise<void>[] = [];
    reqs.push(
      authFetch("/notifications").then(async (r) => {
        if (r.ok) setNotifications(((await r.json()) as { items: Notification[] }).items);
      }),
    );
    if (isAdmin) {
      reqs.push(
        authFetch("/admin/chat/conversations").then(async (r) => {
          if (r.ok) setConversations(((await r.json()) as { items: ChatConversation[] }).items);
        }),
      );
    } else {
      reqs.push(
        authFetch("/chat/me").then(async (r) => {
          if (r.ok) setMessages(((await r.json()) as { messages: ChatMessage[] }).messages);
        }),
      );
    }
    await Promise.all(reqs);
  }, [authFetch, isAdmin]);

  useEffect(() => {
    if (status === "anon") router.replace("/login?next=/inbox");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authed") return;
    let active = true;
    (async () => {
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [status, load]);

  // Live refresh on any inbox ping (new notification or chat message).
  useLiveSync(status === "authed" ? "inbox" : null, load);

  const unreadNotifs = notifications.filter((n) => !n.readAt).length;
  const lastMessages = messages.slice(-5);
  const unreadConvos = conversations.filter((c) => c.unread);

  async function markAllRead() {
    setMarking(true);
    try {
      const res = await authFetch("/notifications", { method: "POST" });
      if (!res.ok) {
        toast.error(await errorFromResponse(res));
        return;
      }
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    } catch {
      toast.error("Network error, please try again.");
    } finally {
      setMarking(false);
      pingInboxLocal();
    }
  }

  // Click a notification to mark just that one read. Update locally at once (so the
  // "unread" dot and count drop instantly) and ping the header bell to re-count.
  async function markOne(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    try {
      await authFetch(`/notifications/${id}/read`, { method: "POST" });
    } catch {
      // best-effort; the live poll will reconcile
    } finally {
      pingInboxLocal();
    }
  }

  if (status === "loading" || status === "anon") {
    return (
      <Section tone="surface" className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-muted size-6 animate-spin" aria-hidden="true" />
      </Section>
    );
  }

  return (
    <Section tone="surface" className="min-h-[70vh]">
      <Container className="flex max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-1">
          <span
            data-reveal
            suppressHydrationWarning
            className="text-primary text-xs font-semibold tracking-[0.2em] uppercase"
          >
            Your account
          </span>
          <RevealHeading text="Inbox" className="text-[clamp(1.5rem,4vw,2.25rem)]" />
          <p data-reveal suppressHydrationWarning className="text-secondary text-sm">
            Messages and notifications in one place.
          </p>
        </div>

        <AlertSettings />

        {loading ? (
          <Skeleton className="border-border h-72 border" />
        ) : (
          <>
            {/* Messages */}
            <section className="border-border bg-background flex flex-col gap-4 rounded-lg border p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="text-primary size-5" aria-hidden="true" />
                  <h2 className="text-h3 font-semibold">Messages</h2>
                </div>
                <Link
                  href="/messages"
                  className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-sm font-medium transition-colors duration-(--dur-fast)"
                >
                  Open chat
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              {isAdmin ? (
                unreadConvos.length === 0 ? (
                  <p className="text-muted text-sm">No conversations need a reply.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {unreadConvos.slice(0, 5).map((c) => (
                      <li key={c.id}>
                        <Link
                          href="/messages"
                          className="border-border hover:border-primary flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors duration-(--dur-fast)"
                        >
                          <span className="min-w-0">
                            <span className="text-foreground block text-sm font-medium">
                              {c.userName}
                            </span>
                            <span className="text-muted block truncate text-xs">
                              {c.lastMessage ?? ""}
                            </span>
                          </span>
                          <span
                            className="bg-accent size-2 shrink-0 rounded-full"
                            aria-label="unread"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              ) : lastMessages.length === 0 ? (
                <p className="text-muted text-sm">
                  No messages yet.{" "}
                  <Link href="/messages" className="text-primary font-medium">
                    Start a conversation
                  </Link>
                  .
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lastMessages.map((m) => {
                    const mine = m.senderRole === "user";
                    return (
                      <div
                        key={m.id}
                        className={cn("flex", mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-3 py-1.5 text-sm",
                            mine
                              ? "bg-primary text-on-primary rounded-br-sm"
                              : "bg-surface-2 text-foreground rounded-bl-sm",
                          )}
                        >
                          <span
                            className={cn(
                              "mb-0.5 block text-[10px] font-semibold tracking-wide uppercase",
                              mine ? "text-on-primary/70" : "text-primary",
                            )}
                          >
                            {mine ? "You" : "Admin"}
                          </span>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p
                            className={cn(
                              "mt-0.5 text-[10px]",
                              mine ? "text-on-primary/70" : "text-muted",
                            )}
                          >
                            {timeFmt.format(new Date(m.createdAt))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Notifications */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="text-primary size-5" aria-hidden="true" />
                  <h2 className="text-h3 font-semibold">Notifications</h2>
                  <span className="text-muted text-sm">{unreadNotifs} unread</span>
                </div>
                {unreadNotifs > 0 ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void markAllRead()}
                    loading={marking}
                  >
                    {marking ? null : <CheckCheck className="size-4" aria-hidden="true" />}
                    Mark all read
                  </Button>
                ) : null}
              </div>

              {notifications.length === 0 ? (
                <div className="border-border text-secondary flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
                  <Bell className="text-muted size-7" aria-hidden="true" />
                  <p>You have no notifications yet.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {notifications.map((n) => {
                    // Announcement fan-outs deep-link to the announcements board; other
                    // (admin-sent) notices stay in place.
                    const isAnnouncement = n.body.startsWith("New announcement:");
                    const inner = (
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            n.readAt ? "bg-transparent" : "bg-accent",
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-foreground text-sm whitespace-pre-line">{n.body}</p>
                          <p className="text-muted mt-1 flex items-center gap-1 text-xs">
                            {formatDate(n.createdAt)}
                            {isAnnouncement ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-primary inline-flex items-center gap-0.5 font-medium">
                                  View <ArrowRight className="size-3" aria-hidden="true" />
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    );
                    const unread = !n.readAt;
                    const cls = cn(
                      "block w-full rounded-lg border p-4 text-left transition-colors duration-(--dur-fast)",
                      n.readAt
                        ? "border-border bg-background"
                        : "border-primary/40 bg-primary-soft/40",
                      unread && "hover:border-primary cursor-pointer",
                      isAnnouncement && "hover:border-primary",
                    );
                    return (
                      <li key={n.id}>
                        {isAnnouncement ? (
                          <Link
                            href="/announcements"
                            className={cls}
                            onClick={() => {
                              if (unread) void markOne(n.id);
                            }}
                          >
                            {inner}
                          </Link>
                        ) : unread ? (
                          <button type="button" className={cls} onClick={() => void markOne(n.id)}>
                            {inner}
                          </button>
                        ) : (
                          <div className={cls}>{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </Container>
    </Section>
  );
}
