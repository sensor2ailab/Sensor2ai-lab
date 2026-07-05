import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import {
  hashPassword,
  verifyPassword,
  passwordPolicy,
  generateSecurePassword,
} from "@/server/auth/password";
import { cursorArgs, toPage, type Page } from "@/server/http/pagination";
import { accountCreated, passwordReset, type MailDraft } from "@/server/mail/drafts";

export interface CreateUserInput {
  email: string;
  fullName: string;
  phone?: string;
  role: "admin" | "user";
  password?: string; // omit → a temp password is generated and returned as a draft
}

export async function createUser(
  input: CreateUserInput,
): Promise<{ user: User; draft?: MailDraft }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Errors.conflict("A user with this email already exists");

  let mustChangePassword = false;
  let plain = input.password;
  if (plain) {
    passwordPolicy.parse(plain);
  } else {
    plain = generateSecurePassword();
    mustChangePassword = true;
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      passwordHash: await hashPassword(plain),
      mustChangePassword,
    },
  });

  const draft = mustChangePassword
    ? accountCreated({ to: user.email, name: user.fullName, tempPassword: plain })
    : undefined;
  return { user, draft };
}

export async function listUsers(limit: number, cursor?: string): Promise<Page<User>> {
  const rows = await prisma.user.findMany(cursorArgs(limit, cursor));
  return toPage(rows, limit);
}

export interface UpdateUserInput {
  fullName?: string;
  phone?: string | null;
  role?: "admin" | "user";
  isActive?: boolean;
}

// Deactivating a user also kills their sessions immediately (bump tokenVersion +
// revoke refresh tokens), so an in-flight access token stops working.
export async function updateUser(id: string, patch: UpdateUserInput): Promise<User> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw Errors.notFound("User not found");

  const data: Prisma.UserUpdateInput = { ...patch };
  const deactivating = patch.isActive === false && target.isActive;
  if (deactivating) data.tokenVersion = { increment: 1 };

  const [user] = await prisma.$transaction([
    prisma.user.update({ where: { id }, data }),
    ...(deactivating
      ? [
          prisma.refreshToken.updateMany({
            where: { userId: id, revokedAt: null },
            data: { revokedAt: new Date() },
          }),
        ]
      : []),
  ]);
  return user;
}

// Admin-driven reset: set a fresh temp password, force a change on next login, and
// invalidate all existing sessions. Returns a draft for the admin to send.
export async function resetUserPassword(id: string): Promise<{ draft: MailDraft }> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Errors.notFound("User not found");

  const temp = generateSecurePassword();
  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(temp),
        mustChangePassword: true,
        tokenVersion: { increment: 1 },
      },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { draft: passwordReset({ to: user.email, name: user.fullName, tempPassword: temp }) };
}

// Self-service change: verify current, apply policy, rotate sessions. Returns the
// user so the caller can mint a fresh session (the old one is invalidated).
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Errors.unauthorized();

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) throw Errors.badRequest("Current password is incorrect");
  passwordPolicy.parse(newPassword);

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(newPassword),
        mustChangePassword: false,
        tokenVersion: { increment: 1 },
      },
    }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  return updated;
}
