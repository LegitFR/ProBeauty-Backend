-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "ifthenpay_method" TEXT,
ADD COLUMN     "ifthenpay_payment_url" TEXT,
ADD COLUMN     "ifthenpay_request_id" TEXT;
