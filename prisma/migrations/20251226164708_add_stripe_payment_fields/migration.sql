-- AlterTable: Add Stripe payment fields to payments table
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "failure_reason" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB,
ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT,
ADD COLUMN IF NOT EXISTS "stripe_event_id" TEXT,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);

-- CreateIndex: Add index on stripe_event_id
CREATE INDEX IF NOT EXISTS "payments_stripe_event_id_idx" ON "payments"("stripe_event_id");

-- CreateIndex: Add unique constraint on stripe_event_id
CREATE UNIQUE INDEX IF NOT EXISTS "payments_stripe_event_id_key" ON "payments"("stripe_event_id");
