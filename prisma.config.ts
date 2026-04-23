import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma CLI does not always load .env.local automatically.
// We explicitly load both files so local development matches Next.js behavior.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
