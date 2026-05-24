-- AlterTable: Add service_ids column as an array
ALTER TABLE "bookings" ADD COLUMN "service_ids" TEXT[] NOT NULL DEFAULT '{}';

-- Data Migration: Copy existing service_id to service_ids array
UPDATE "bookings" SET "service_ids" = ARRAY["service_id"] WHERE "service_id" IS NOT NULL;

-- Drop the old index on service_id
DROP INDEX IF EXISTS "bookings_service_id_idx";

-- AlterTable: Make service_id nullable (for transition period)
ALTER TABLE "bookings" ALTER COLUMN "service_id" DROP NOT NULL;

-- AlterTable: Drop the foreign key constraint first
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_service_id_fkey";

-- AlterTable: Drop the old service_id column
ALTER TABLE "bookings" DROP COLUMN "service_id";
