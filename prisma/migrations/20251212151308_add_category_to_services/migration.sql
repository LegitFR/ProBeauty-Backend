-- AlterTable
ALTER TABLE "services" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");
