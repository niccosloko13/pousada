import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool; prismaEnvWarned?: boolean };

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL ?? null;
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    return null;
  }

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function logMissingDatabaseUrlOnce() {
  if (globalForPrisma.prismaEnvWarned) return;
  globalForPrisma.prismaEnvWarned = true;
  console.error(
    "[prisma] DATABASE_URL is missing. Set DATABASE_URL in .env or .env.local (or Vercel Project Environment Variables).",
  );
}

function getPrisma(): PrismaClient | null {
  if (!globalForPrisma.prisma) {
    const client = createPrismaClient();
    if (!client) {
      logMissingDatabaseUrlOnce();
      return null;
    }
    globalForPrisma.prisma = client;
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    if (!client) {
      return () => {
        throw new Error(
          "Prisma client is unavailable because DATABASE_URL is not configured. " +
            "Define DATABASE_URL in .env/.env.local (development) or in Vercel environment variables.",
        );
      };
    }
    const value = Reflect.get(client, prop, receiver) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
