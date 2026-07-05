import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { env } from "@/server/config/env";
import { Errors } from "@/server/http/errors";
import { logger } from "@/server/logging/logger";

// Refresh tokens are opaque random strings. Only their SHA-256 hash is stored, so
// a DB leak does not expose usable tokens. Each is single-use and rotated.

interface Meta {
  ip?: string;
  userAgent?: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

function ttlDate(): Date {
  return new Date(Date.now() + env().REFRESH_TOKEN_TTL * 1000);
}

export async function issueRefreshToken(
  userId: string,
  meta: Meta,
): Promise<{ token: string; expiresAt: Date }> {
  const token = newOpaqueToken();
  const expiresAt = ttlDate();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
  return { token, expiresAt };
}

// Rotate: verify the presented token, revoke it, and issue a fresh one. Presenting
// an already-revoked token means the token was stolen/replayed → revoke the whole
// family and bump tokenVersion (kills outstanding access tokens too).
export async function rotateRefreshToken(
  presented: string,
  meta: Meta,
): Promise<{ userId: string; token: string; expiresAt: Date }> {
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashToken(presented) },
  });
  if (!record) throw Errors.unauthorized("Invalid refresh token");

  if (record.revokedAt) {
    logger.warn({ userId: record.userId }, "Refresh token reuse detected, revoking family");
    await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: { tokenVersion: { increment: 1 } },
      }),
    ]);
    throw Errors.unauthorized("Refresh token reuse detected");
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw Errors.unauthorized("Refresh token expired");
  }

  const token = newOpaqueToken();
  const expiresAt = ttlDate();
  await prisma.$transaction(async (tx) => {
    const created = await tx.refreshToken.create({
      data: {
        userId: record.userId,
        tokenHash: hashToken(token),
        expiresAt,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });
    await tx.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), replacedBy: created.id },
    });
  });

  return { userId: record.userId, token, expiresAt };
}

export async function revokeRefreshToken(presented: string): Promise<void> {
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashToken(presented) },
  });
  if (record && !record.revokedAt) {
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
  }
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
