-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3),
ADD COLUMN     "otp_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "refresh_token" TEXT;
