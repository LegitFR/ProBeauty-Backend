-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "staff_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "service_ids" DROP DEFAULT;
