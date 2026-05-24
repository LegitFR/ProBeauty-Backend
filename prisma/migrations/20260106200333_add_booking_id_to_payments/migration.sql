-- AlterTable: Make order_id nullable in payments table
-- This is SAFE: All existing payments have orderId set, making it nullable doesn't change existing data
ALTER TABLE "payments" ALTER COLUMN "order_id" DROP NOT NULL;

-- AlterTable: Add booking_id column as nullable
-- This is SAFE: New column is nullable, existing records are unaffected
ALTER TABLE "payments" ADD COLUMN "booking_id" TEXT;

-- AddForeignKey: Create foreign key relationship to bookings table
-- This is SAFE: Only affects new records with booking_id set
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: Add index on booking_id for query performance
-- This is SAFE: Index creation doesn't affect existing data
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

