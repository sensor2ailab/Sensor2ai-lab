"use client";

// A tiny in-tab event bus so that when one view changes the unread state (e.g. the
// inbox marks a notification read), other mounted views — chiefly the header bell —
// refresh instantly, without waiting for the next realtime ping or poll cycle.
const EVENT = "inbox:local-refresh";

export function pingInboxLocal(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function onInboxLocal(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
