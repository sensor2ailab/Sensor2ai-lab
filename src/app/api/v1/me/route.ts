import { route, ok } from "@/server/http/respond";
import { Errors } from "@/server/http/errors";
import { requireAuth } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { toPublicUser } from "@/server/users/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const claims = await requireAuth(req);
  const user = await prisma.user.findUnique({ where: { id: claims.sub } });
  if (!user) throw Errors.unauthorized();
  return ok({ user: toPublicUser(user) });
});
