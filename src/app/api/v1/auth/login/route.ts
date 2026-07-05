import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { clientMeta } from "@/server/http/request";
import { enforceRateLimit } from "@/server/http/rate-limit";
import { login } from "@/server/auth/service";
import { setRefreshCookie } from "@/server/auth/cookies";
import { toPublicUser } from "@/server/users/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export const POST = route(async (req) => {
  const meta = clientMeta(req);
  // Brute-force guard: 10 attempts per minute per client IP.
  enforceRateLimit(`login:${meta.ip ?? "unknown"}`, 10, 60_000);
  const { email, password } = schema.parse(await req.json());
  const result = await login(email, password, meta);
  await setRefreshCookie(result.refreshToken, result.refreshExpiresAt);
  return ok({
    accessToken: result.accessToken,
    expiresIn: result.expiresIn,
    user: toPublicUser(result.user),
  });
});
