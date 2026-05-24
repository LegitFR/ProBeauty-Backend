/*
  Warnings:

  - You are about to drop the `promotions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."promotions" DROP CONSTRAINT "promotions_salon_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."staff" DROP CONSTRAINT "staff_user_id_fkey";

-- DropIndex
DROP INDEX "public"."staff_user_id_idx";

-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "user_id" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."promotions";

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
