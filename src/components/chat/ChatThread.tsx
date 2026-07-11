"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Loader2, Send } from "lucide-react";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/api-types";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

// Presentational thread: message bubbles aligned by whether the viewer sent them,
// plus a composer. Enter sends, Shift+Enter adds a newline.
export function ChatThread({
  messages,
  viewerRole,
  onSend,
  sending,
  emptyHint,
}: {
  messages: ChatMessage[];
  viewerRole: "admin" | "user";
  onSend: (text: string) => void;
  sending: boolean;
  emptyHint: string;
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Pin to the latest message by scrolling the log container itself — never
  // scrollIntoView, which would drag the whole page (and jump on every switch).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function submit() {
    const t = text.trim();
    if (!t || sending) return;
    onSend(t);
    setText("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation"
        className="chat-surface thin-scroll flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <p className="text-muted py-10 text-center text-sm">{emptyHint}</p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const mine = msg.senderRole === viewerRole;
              return (
                <m.div
                  key={msg.id}
                  layout={!reduce}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: reduce ? 0 : 0.24, ease: easeOut }}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-lg px-3.5 py-2 text-sm whitespace-pre-wrap shadow-sm",
                      mine
                        ? "bg-primary text-on-primary rounded-br-sm"
                        : "bg-background text-foreground border-border rounded-bl-sm border",
                    )}
                  >
                    <p>{msg.body}</p>
                    <p
                      className={cn("mt-1 text-[10px]", mine ? "text-on-primary/70" : "text-muted")}
                    >
                      {timeFmt.format(new Date(msg.createdAt))}
                    </p>
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="border-border bg-background flex items-end gap-2 border-t p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={4000}
          placeholder="Write a message…"
          aria-label="Message"
          className="border-border bg-background text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/25 max-h-32 min-h-11 flex-1 resize-none rounded-md border px-3 py-2.5 text-sm transition-[border-color,box-shadow] duration-(--dur-fast) focus:ring-2 focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className="bg-primary text-on-primary hover:bg-primary-hover flex size-11 shrink-0 items-center justify-center rounded-md transition-colors duration-(--dur-fast) disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
