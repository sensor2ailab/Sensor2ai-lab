import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { clientMeta } from "@/server/http/request";
import { enforceRateLimit } from "@/server/http/rate-limit";
import { requireAuth } from "@/server/auth/session";
import { changePassword } from "@/server/users/service";
import { mintSession } from "@/server/auth/service";
import { setRefreshCookie } from "@/server/auth/cookies";
import { toPublicUser } from "@/server/users/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({ currentPassword: z.string().min(1), newPassword: z.string().min(1) })
  .strict();

// Allowed even while must_change_password is set (this is how the user clears it).
// Rotates all sessions, then issues a fresh one so the caller stays signed in.
export const POST = route(async (req) => {
  const claims = await requireAuth(req);
  enforceRateLimit(`change-password:${claims.sub}`, 5, 60_000);
  const { currentPassword, newPassword } = schema.parse(await req.json());
  const user = await changePassword(claims.sub, currentPassword, newPassword);
  const session = await mintSession(user, clientMeta(req));
  await setRefreshCookie(session.refreshToken, session.refreshExpiresAt);
  return ok({
    accessToken: session.accessToken,
    expiresIn: session.expiresIn,
    user: toPublicUser(user),
  });
});
