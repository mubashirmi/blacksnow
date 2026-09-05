/*
  Warnings:

  - Added the required column `updatedAt` to the `EmailUsage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailOverageChargeStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REQUIRES_ACTION');

-- DropForeignKey
ALTER TABLE "EmailUsage" DROP CONSTRAINT "EmailUsage_authId_fkey";

-- AlterTable
ALTER TABLE "EmailUsage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "includedLimit" INTEGER NOT NULL DEFAULT 100000,
ADD COLUMN     "overageBilledMicros" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "overageRateMicros" INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "EmailOverageCharge" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authId" INTEGER NOT NULL,
    "billingDate" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "coveredMicros" BIGINT NOT NULL,
    "status" "EmailOverageChargeStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "stripePaymentMethodId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "chargedAt" TIMESTAMP(3),
    "usageAppliedAt" TIMESTAMP(3),

    CONSTRAINT "EmailOverageCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailOverageCharge_stripePaymentIntentId_key" ON "EmailOverageCharge"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailOverageCharge_idempotencyKey_key" ON "EmailOverageCharge"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EmailOverageCharge_authId_idx" ON "EmailOverageCharge"("authId");

-- CreateIndex
CREATE INDEX "EmailOverageCharge_status_idx" ON "EmailOverageCharge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailOverageCharge_authId_billingDate_key" ON "EmailOverageCharge"("authId", "billingDate");

-- CreateIndex
CREATE INDEX "EmailUsage_authId_idx" ON "EmailUsage"("authId");

-- AddForeignKey
ALTER TABLE "EmailUsage" ADD CONSTRAINT "EmailUsage_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailOverageCharge" ADD CONSTRAINT "EmailOverageCharge_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
