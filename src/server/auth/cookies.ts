import { cookies } from "next/headers";
import { isProd } from "@/server/config/env";

// httpOnly refresh cookie, scoped to the auth endpoints only (never sent to other
// routes). SameSite=Strict + Secure (in prod) mitigate CSRF/leakage.
export const REFRESH_COOKIE = "refresh_token";
const COOKIE_PATH = "/api/v1/auth";

export async function setRefreshCookie(token: string, expiresAt: Date): Promise<void> {
  const jar = await cookies();
  jar.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: COOKIE_PATH,
    expires: expiresAt,
  });
}

export async function clearRefreshCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: 0,
  });
}

export async function getRefreshCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value;
}
