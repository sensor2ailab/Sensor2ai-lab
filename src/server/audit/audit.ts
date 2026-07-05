import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/logging/logger";

// Records an admin mutation. Never throws into the caller; an audit failure must
// not fail the underlying action.
export async function logAction(params: {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ?? {},
        ip: params.ip,
      },
    });
  } catch (error) {
    logger.error({ err: error, action: params.action }, "Failed to write audit log");
  }
}
