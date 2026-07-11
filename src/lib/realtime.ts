import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// A single browser Supabase client used purely for Realtime signalling. It only
// spins up when the public env vars are present; otherwise chat degrades to polling.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function realtimeEnabled(): boolean {
  return getClient() !== null;
}

// Subscribe to a chat topic's "message" pings. The payload is intentionally empty
// (just a nudge to refetch through the authenticated API). Returns an unsubscribe fn.
export function subscribeChat(topic: string, onSignal: () => void): () => void {
  const c = getClient();
  if (!c) return () => {};
  const channel = c
    .channel(topic, { config: { broadcast: { self: true } } })
    .on("broadcast", { event: "message" }, () => onSignal())
    .subscribe();
  return () => {
    void c.removeChannel(channel);
  };
}
