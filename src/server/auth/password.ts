import { hash, verify } from "@node-rs/argon2";
import { randomInt } from "node:crypto";
import { z } from "zod";

// argon2id is @node-rs/argon2's default variant; params are OWASP-aligned. (We
// avoid the exported Algorithm const enum; isolatedModules forbids reading it.)
const ARGON2_OPTIONS = {
  memoryCost: 19_456, // ~19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  return verify(passwordHash, plain);
}

// Strength policy for user-chosen passwords (set/change/reset).
export const passwordPolicy = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password must be at most 128 characters")
  .refine((v) => /[a-z]/.test(v), "Must include a lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Must include an uppercase letter")
  .refine((v) => /[0-9]/.test(v), "Must include a digit")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Must include a special character");

const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGIT = "23456789";
const SPECIAL = "!@#$%^&*-_=+";
const ALL = LOWER + UPPER + DIGIT + SPECIAL;

function pick(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)]!;
}

// Cryptographically secure temp password (approve flow): 10 chars, guaranteed to
// contain >=1 of each class, then shuffled. Emailed once, never persisted.
export function generateSecurePassword(length = 10): string {
  const required = [pick(LOWER), pick(UPPER), pick(DIGIT), pick(SPECIAL)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => pick(ALL));
  const chars = [...required, ...rest];
  // Fisher-Yates shuffle with a secure RNG.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}
