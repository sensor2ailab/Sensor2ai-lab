import { route, ok } from "@/server/http/respond";
import { clientMeta } from "@/server/http/request";
import { enforceRateLimit } from "@/server/http/rate-limit";
import { refreshSession } from "@/server/auth/service";
import { getRefreshCookie, setRefreshCookie, clearRefreshCookie } from "@/server/auth/cookies";
import { toPublicUser } from "@/server/users/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const meta = clientMeta(req);
  enforceRateLimit(`refresh:${meta.ip ?? "unknown"}`, 60, 60_000);
  const presented = await getRefreshCookie();
  // No cookie = anonymous visitor. This endpoint is the app's silent "am I signed in?"
  // probe on load, so "nobody is signed in" is a normal 200 with a null user, not a
  // 401 (which the browser would log as a failed request on every anonymous page view).
  if (!presented) return ok({ user: null });
  try {
    const result = await refreshSession(presented, meta);
    await setRefreshCookie(result.refreshToken, result.refreshExpiresAt);
    return ok({
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: toPublicUser(result.user),
    });
  } catch (error) {
    // Bad/reused/expired refresh → clear the cookie so the client stops retrying.
    await clearRefreshCookie();
    throw error;
  }
});
