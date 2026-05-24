-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "average_rating" DOUBLE PRECISION,
ADD COLUMN     "total_ratings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "staff_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_reviews_user_id_idx" ON "staff_reviews"("user_id");

-- CreateIndex
CREATE INDEX "staff_reviews_staff_id_idx" ON "staff_reviews"("staff_id");

-- CreateIndex
CREATE INDEX "staff_reviews_booking_id_idx" ON "staff_reviews"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_reviews_user_id_staff_id_key" ON "staff_reviews"("user_id", "staff_id");

-- AddForeignKey
ALTER TABLE "staff_reviews" ADD CONSTRAINT "staff_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_reviews" ADD CONSTRAINT "staff_reviews_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_reviews" ADD CONSTRAINT "staff_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
