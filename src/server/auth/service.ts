import { randomBytes } from "node:crypto";
import type { User } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { env } from "@/server/config/env";
import { Errors } from "@/server/http/errors";
import { hashPassword, verifyPassword } from "./password";
import { signAccessToken } from "./jwt";
import { issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from "./tokens";
import { logAction } from "@/server/audit/audit";

interface Meta {
  ip?: string;
  userAgent?: string;
}

export interface AuthResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: User;
}

// A valid argon2id hash of random bytes, verified against on unknown-email logins
// so the response time does not reveal whether the account exists.
let dummyHash: string | null = null;
async function getDummyHash(): Promise<string> {
  if (!dummyHash) dummyHash = await hashPassword(randomBytes(24).toString("hex"));
  return dummyHash;
}

export async function mintSession(user: User, meta: Meta): Promise<AuthResult> {
  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    tv: user.tokenVersion,
    mcp: user.mustChangePassword,
  });
  const refresh = await issueRefreshToken(user.id, meta);
  return {
    accessToken,
    expiresIn: env().ACCESS_TOKEN_TTL,
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
    user,
  };
}

export async function login(email: string, password: string, meta: Meta): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);
  if (!user || !valid || !user.isActive) {
    await logAction({
      action: "auth.login_failed",
      entity: "user",
      metadata: { email },
      ip: meta.ip,
    });
    throw Errors.unauthorized("Invalid email or password");
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logAction({
    actorId: user.id,
    action: "auth.login",
    entity: "user",
    entityId: user.id,
    ip: meta.ip,
  });
  return mintSession(user, meta);
}

export async function refreshSession(presentedToken: string, meta: Meta): Promise<AuthResult> {
  const rotated = await rotateRefreshToken(presentedToken, meta);
  const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
  if (!user || !user.isActive) throw Errors.unauthorized("Session is no longer valid");
  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    tv: user.tokenVersion,
    mcp: user.mustChangePassword,
  });
  return {
    accessToken,
    expiresIn: env().ACCESS_TOKEN_TTL,
    refreshToken: rotated.token,
    refreshExpiresAt: rotated.expiresAt,
    user,
  };
}

export async function logout(presentedToken: string | undefined): Promise<void> {
  if (presentedToken) await revokeRefreshToken(presentedToken);
}
