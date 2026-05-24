-- AlterTable: Add optional image column to staff table
-- This column is nullable, so existing staff records will have NULL values
-- New staff records can optionally include an image URL

ALTER TABLE "staff" ADD COLUMN "image" TEXT;

