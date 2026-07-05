import { route, ok } from "@/server/http/respond";
import { logout } from "@/server/auth/service";
import { getRefreshCookie, clearRefreshCookie } from "@/server/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Revokes the current refresh token and clears the cookie. Safe to call even with
// an expired access token (the httpOnly cookie is the credential being revoked).
export const POST = route(async () => {
  const presented = await getRefreshCookie();
  await logout(presented);
  await clearRefreshCookie();
  return ok({ ok: true });
});
