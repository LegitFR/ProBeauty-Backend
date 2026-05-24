/*
  Warnings:

  - The `images` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `images` column on the `salons` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "images",
ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "salons" DROP COLUMN "images",
ADD COLUMN     "images" TEXT[];
