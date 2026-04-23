import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function writeAdminAuditLog(input: {
  adminUserId?: string | null;
  action: string;
  resource: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.JsonValue;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: input.adminUserId ?? null,
      action: input.action,
      resource: input.resource,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}
