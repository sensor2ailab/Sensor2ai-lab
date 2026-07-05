import { Errors } from "@/server/http/errors";

// Fixed-window in-memory limiter. Correct for a single instance (the current
// deploy target); swap the Map for Redis when horizontal scaling is added.
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function enforceRateLimit(key: string, limit: number, windowMs: number): void {
  const { allowed, retryAfter } = checkRateLimit(key, limit, windowMs);
  if (!allowed) throw Errors.rateLimited(`Too many requests. Try again in ${retryAfter}s.`);
}
