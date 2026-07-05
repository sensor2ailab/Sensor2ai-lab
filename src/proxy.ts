import { NextResponse, type NextRequest } from "next/server";

// Security headers applied to every response, plus CORS for the JSON API. Runs
// before route handlers; keep it dependency-free so it stays on the edge runtime.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "off",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function corsOrigin(req: NextRequest): string | null {
  const allowed = process.env.FRONTEND_ORIGIN;
  const origin = req.headers.get("origin");
  if (!allowed || !origin) return null;
  return origin === allowed ? origin : null;
}

function applyCors(req: NextRequest, res: NextResponse): void {
  const origin = corsOrigin(req);
  if (!origin) return;
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Max-Age", "86400");
  res.headers.append("Vary", "Origin");
}

export function proxy(req: NextRequest): NextResponse {
  const isApi = req.nextUrl.pathname.startsWith("/api/");

  // Short-circuit CORS preflight for the API.
  if (isApi && req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    applyCors(req, res);
    return res;
  }

  const res = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.headers.set(key, value);
  if (isApi) applyCors(req, res);
  return res;
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
