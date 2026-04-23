-- AlterTable
ALTER TABLE "Room" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Room_isActive_category_idx" ON "Room"("isActive", "category");
