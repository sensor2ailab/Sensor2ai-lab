import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { bearerToken } from "@/server/http/request";
import { verifyAccessToken, type AccessClaims } from "./jwt";

// Verifies the access token AND re-checks the DB so that deactivation and
// "logout everywhere" (tokenVersion bump) take effect before the token expires.
export async function requireAuth(req: Request): Promise<AccessClaims> {
  const token = bearerToken(req);
  if (!token) throw Errors.unauthorized();
  const claims = await verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { isActive: true, tokenVersion: true },
  });
  if (!user || !user.isActive || user.tokenVersion !== claims.tv) {
    throw Errors.unauthorized("Session is no longer valid");
  }
  return claims;
}

export async function requireAdmin(req: Request): Promise<AccessClaims> {
  const claims = await requireAuth(req);
  if (claims.role !== "admin") throw Errors.forbidden();
  return claims;
}

// First-login gate: while must_change_password is set, only the change-password
// endpoint is reachable.
export function assertPasswordChanged(claims: AccessClaims): void {
  if (claims.mcp) {
    throw Errors.forbidden("You must change your password before using this resource");
  }
}
