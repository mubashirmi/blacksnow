-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "otp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpExpirationDate" TIMESTAMP(3),
ADD COLUMN     "otpVerified" BOOLEAN NOT NULL DEFAULT false;
