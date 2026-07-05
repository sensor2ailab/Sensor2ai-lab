import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "@/server/config/env";
import { Errors } from "@/server/http/errors";

const encoder = new TextEncoder();

export interface AccessClaims {
  sub: string; // user id
  role: "admin" | "user";
  tv: number; // token version (for "logout all")
  mcp: boolean; // must_change_password
}

const claimsSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(["admin", "user"]),
  tv: z.number().int().nonnegative(),
  mcp: z.boolean(),
});

export async function signAccessToken(claims: AccessClaims): Promise<string> {
  const secret = encoder.encode(env().JWT_ACCESS_SECRET);
  return new SignJWT({ role: claims.role, tv: claims.tv, mcp: claims.mcp })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${env().ACCESS_TOKEN_TTL}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const secret = encoder.encode(env().JWT_ACCESS_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return claimsSchema.parse({
      sub: payload.sub,
      role: payload.role,
      tv: payload.tv,
      mcp: payload.mcp,
    });
  } catch {
    throw Errors.unauthorized("Invalid or expired access token");
  }
}
