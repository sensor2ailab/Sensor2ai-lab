import { route, ok } from "@/server/http/respond";
import { Errors } from "@/server/http/errors";
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
  if (!presented) throw Errors.unauthorized("Missing refresh token");
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
