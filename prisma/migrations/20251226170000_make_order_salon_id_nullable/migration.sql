-- AlterTable: Make salon_id nullable in orders table
-- This is a safe migration that preserves all existing data
-- Existing orders will keep their salon_id values
-- New multi-salon orders can have salon_id = NULL

ALTER TABLE "orders" ALTER COLUMN "salon_id" DROP NOT NULL;

