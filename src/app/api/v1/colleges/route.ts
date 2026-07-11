import { route, ok } from "@/server/http/respond";
import { colleges as FALLBACK } from "@/data/colleges";

export const runtime = "nodejs";

// Free, key-less university directory (Hipolabs). We proxy it server-side rather than
// calling it from the browser: no CORS surprises, one cached upstream hit per query,
// and we can degrade gracefully. An empty query returns our curated shortlist (fast,
// no upstream call); typing searches the live directory worldwide.
//
// Plain HTTP is deliberate: the host's TLS endpoint hangs, while HTTP answers in ~0.5s.
// This is a server-to-server read of a public directory therefore, no credentials or personal
// data leave the server, only the college search term therefore, so the trade-off is acceptable.
// If the host ever fixes TLS, just flip this to https.
const SOURCE = "http://universities.hipolabs.com/search";
const LIMIT = 60;

function fromFallback(q: string): string[] {
  const lower = q.toLowerCase();
  const list = q ? FALLBACK.filter((c) => c.toLowerCase().includes(lower)) : FALLBACK;
  return list.slice(0, LIMIT);
}

export const GET = route(async (req) => {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();

  // No query: show the curated shortlist immediately.
  if (q.length < 2) return ok({ items: fromFallback(q), source: "curated" });

  try {
    const res = await fetch(`${SOURCE}?name=${encodeURIComponent(q)}`, {
      // The directory barely changes; cache each query for a day.
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);

    const data = (await res.json()) as { name?: string; country?: string }[];
    const items = [...new Set(data.map((d) => d.name).filter((n): n is string => Boolean(n)))]
      .sort((a, b) => a.localeCompare(b))
      .slice(0, LIMIT);

    // Nothing upstream? Still offer local matches so the applicant isn't stuck.
    if (items.length === 0) return ok({ items: fromFallback(q), source: "curated" });
    return ok({ items, source: "directory" });
  } catch {
    // Upstream slow or down therefore, the apply form keeps working on the bundled list, and
    // the applicant can always type their own college anyway.
    return ok({ items: fromFallback(q), source: "fallback" });
  }
});
