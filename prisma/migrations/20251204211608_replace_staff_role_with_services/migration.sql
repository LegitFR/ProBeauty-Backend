-- CreateTable
CREATE TABLE "staff_services" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_services_staff_id_service_id_key" ON "staff_services"("staff_id", "service_id");

-- CreateIndex
CREATE INDEX "staff_services_staff_id_idx" ON "staff_services"("staff_id");

-- CreateIndex
CREATE INDEX "staff_services_service_id_idx" ON "staff_services"("service_id");

-- AddForeignKey
ALTER TABLE "staff_services" ADD CONSTRAINT "staff_services_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_services" ADD CONSTRAINT "staff_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "staff" DROP COLUMN "role";

