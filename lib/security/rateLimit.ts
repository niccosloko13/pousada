import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RateLimitInput = {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
  blockMs?: number;
};

export async function consumeRateLimit(input: RateLimitInput) {
  const now = new Date();
  const key = `${input.scope}:${input.identifier}`;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const existing = await tx.rateLimitBucket.findUnique({ where: { key } });
        const resetAt = new Date(now.getTime() + input.windowMs);
        const blockMs = input.blockMs ?? input.windowMs;

        if (!existing) {
          await tx.rateLimitBucket.create({
            data: { key, scope: input.scope, count: 1, resetAt },
          });
          return { ok: true as const, remaining: Math.max(0, input.limit - 1), resetAt };
        }

        if (existing.blockedUntil && existing.blockedUntil > now) {
          return { ok: false as const, retryAfterMs: existing.blockedUntil.getTime() - now.getTime() };
        }

        if (existing.resetAt <= now) {
          await tx.rateLimitBucket.update({
            where: { key },
            data: { count: 1, resetAt, blockedUntil: null },
          });
          return { ok: true as const, remaining: Math.max(0, input.limit - 1), resetAt };
        }

        const nextCount = existing.count + 1;
        if (nextCount > input.limit) {
          const blockedUntil = new Date(now.getTime() + blockMs);
          await tx.rateLimitBucket.update({
            where: { key },
            data: { count: nextCount, blockedUntil },
          });
          return { ok: false as const, retryAfterMs: blockedUntil.getTime() - now.getTime() };
        }

        await tx.rateLimitBucket.update({
          where: { key },
          data: { count: nextCount },
        });

        return {
          ok: true as const,
          remaining: Math.max(0, input.limit - nextCount),
          resetAt: existing.resetAt,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch {
    // Fail-open to avoid availability regressions.
    return { ok: true as const, remaining: Math.max(0, input.limit - 1), resetAt: new Date(now.getTime() + input.windowMs) };
  }
}

export async function clearRateLimit(scope: string, identifier: string) {
  const key = `${scope}:${identifier}`;
  await prisma.rateLimitBucket.delete({ where: { key } }).catch(() => {});
}
