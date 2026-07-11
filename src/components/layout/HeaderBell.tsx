"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLiveSync } from "@/lib/use-live-sync";
import { onInboxLocal } from "@/lib/inbox-events";
import { playChime, primeAudio, showSystemNotification } from "@/lib/alerts";

// Header bell: a live combined-unread badge (notifications + chat) that links to the
// inbox. Updates instantly over the realtime "inbox" channel, with a polling backstop
// that idles while the tab is hidden. When the count *rises*, it chimes and (if the tab
// isn't focused) raises a native notification, so new activity gets attention at once.
export function HeaderBell() {
  const { status, authFetch } = useAuth();
  const [total, setTotal] = useState(0);
  const [pinged, setPinged] = useState(false);
  const previous = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const authed = status === "authed";

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/inbox/summary");
      if (!res.ok) return;
      const next = ((await res.json()) as { total: number }).total;
      const before = previous.current;
      previous.current = next;
      setTotal(next);

      // Only alert on a genuine increase, and never on the first load of the session.
      if (before !== null && next > before) {
        playChime();
        setPinged(true);
        window.setTimeout(() => setPinged(false), 900);
        if (document.visibilityState !== "visible") {
          const n = next - before;
          showSystemNotification(
            "Sensor2AI Lab",
            n === 1 ? "You have a new message." : `You have ${n} new updates.`,
          );
        }
      }
    } catch {
      // best-effort; the badge simply won't update this cycle
    }
  }, [authFetch]);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      await load();
    })();
  }, [authed, load]);

  // Browsers hold audio until the user interacts; unlock on the first gesture.
  useEffect(() => {
    const unlock = () => primeAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useLiveSync(authed ? "inbox" : null, load);

  // Instant same-tab refresh: when the inbox marks something read, re-count right away
  // rather than waiting for the next poll/realtime ping.
  useEffect(() => {
    if (!authed) return;
    return onInboxLocal(() => void load());
  }, [authed, load]);

  if (!authed) return null;

  return (
    <Link
      href="/inbox"
      aria-label={total > 0 ? `Inbox, ${total} unread` : "Inbox"}
      className="bg-background text-foreground border-border hover:border-primary hover:text-primary shadow-card relative mt-5 inline-flex size-9 items-center justify-center rounded-full border transition-colors duration-(--dur-fast) ease-out sm:size-13"
    >
      {/* The bell rocks when the count rises, pairing the chime with a visual cue. */}
      <m.span
        animate={pinged && !reduce ? { rotate: [0, -14, 12, -8, 6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="inline-flex"
      >
        <Bell className="size-5" aria-hidden="true" />
      </m.span>

      {total > 0 ? (
        <m.span
          key={total}
          initial={reduce ? false : { scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
          className="bg-primary text-on-primary absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums"
        >
          {total > 99 ? "99+" : total}
        </m.span>
      ) : null}

      {/* A one-shot ring pulse to draw the eye. */}
      {pinged && !reduce ? (
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="border-accent pointer-events-none absolute inset-0 rounded-full border-2"
        />
      ) : null}
    </Link>
  );
}
