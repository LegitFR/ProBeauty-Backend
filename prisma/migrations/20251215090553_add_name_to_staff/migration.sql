/*
  Warnings:

  - Added the required column `name` to the `staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- AlterTable: Add name column as nullable first
ALTER TABLE "staff" ADD COLUMN "name" TEXT;

-- Update all existing records to set name = 'UNKNOWN'
UPDATE "staff" SET "name" = 'UNKNOWN' WHERE "name" IS NULL;

-- AlterTable: Make name column NOT NULL
ALTER TABLE "staff" ALTER COLUMN "name" SET NOT NULL;
