import { logger } from "@/server/logging/logger";

// Best-effort Supabase Realtime broadcast over the service-role REST endpoint. All
// persistence has already happened; a failure here just means clients fall back to
// polling. Payloads are content-free "pings" therefore clients refetch through the
// authenticated API, so nothing sensitive travels over the channel.
export async function broadcast(
  messages: { topic: string; payload?: Record<string, unknown> }[],
): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || messages.length === 0) return;

  try {
    const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          topic: m.topic,
          event: "message",
          payload: m.payload ?? {},
        })),
      }),
    });
    if (!res.ok) logger.warn({ status: res.status }, "realtime broadcast failed");
  } catch (err) {
    logger.warn({ err }, "realtime broadcast error");
  }
}

// The global inbox channel: every signed-in user's header bell subscribes to it and
// refetches its unread summary when pinged (new notification or chat message).
export const INBOX_TOPIC = "inbox";

export async function broadcastInbox(): Promise<void> {
  await broadcast([{ topic: INBOX_TOPIC }]);
}
