-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "publicAccessToken" TEXT;

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_publicAccessToken_key" ON "Reservation"("publicAccessToken");

-- CreateIndex
CREATE INDEX "RateLimitBucket_scope_resetAt_idx" ON "RateLimitBucket"("scope", "resetAt");

-- CreateIndex
CREATE INDEX "RateLimitBucket_blockedUntil_idx" ON "RateLimitBucket"("blockedUntil");
