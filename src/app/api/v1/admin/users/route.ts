import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { parsePagination } from "@/server/http/pagination";
import { createUser, listUsers } from "@/server/users/service";
import { toPublicUser } from "@/server/users/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z
  .object({
    email: z.string().email(),
    fullName: z.string().min(1).max(200),
    phone: z.string().max(40).optional(),
    role: z.enum(["admin", "user"]).default("user"),
    password: z.string().optional(),
  })
  .strict();

export const GET = route(async (req) => {
  await requireAdmin(req);
  const { limit, cursor } = parsePagination(req.url);
  const page = await listUsers(limit, cursor);
  return ok({ items: page.items.map(toPublicUser), nextCursor: page.nextCursor });
});

export const POST = route(async (req) => {
  await requireAdmin(req);
  const input = createSchema.parse(await req.json());
  const { user, draft } = await createUser(input);
  return ok({ user: toPublicUser(user), mailDraft: draft ?? null }, { status: 201 });
});
