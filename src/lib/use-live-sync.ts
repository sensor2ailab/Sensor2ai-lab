"use client";

import { useEffect, useRef } from "react";
import { realtimeEnabled, subscribeChat } from "@/lib/realtime";

// Keeps a view fresh: instant realtime pings when Supabase Realtime is configured,
// plus a polling backstop. The poll pauses while the tab is hidden (no wasted
// requests or battery in background tabs) and fires once as soon as it comes back.
export function useLiveSync(topic: string | null, onSignal: () => void): void {
  const cb = useRef(onSignal);
  useEffect(() => {
    cb.current = onSignal;
  });

  useEffect(() => {
    if (!topic) return;
    const fire = () => void cb.current();

    const unsubscribe = subscribeChat(topic, fire);
    // Realtime pings deliver instantly when the socket is healthy; the poll is a
    // backstop. It's kept short (a few seconds) so updates still feel live even if a
    // realtime broadcast is dropped or the project's Realtime isn't reachable.
    const period = realtimeEnabled() ? 6000 : 3000;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") fire();
    }, period);

    const onVisibility = () => {
      if (document.visibilityState === "visible") fire();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [topic]);
}
