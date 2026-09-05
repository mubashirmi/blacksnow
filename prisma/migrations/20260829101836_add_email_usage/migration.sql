/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "emailOverageRate" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
ADD COLUMN     "emailUsageLimit" INTEGER NOT NULL DEFAULT 100000,
ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "EmailUsage" (
    "id" SERIAL NOT NULL,
    "authId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "overageBilled" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmailUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailUsage_authId_month_key" ON "EmailUsage"("authId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_stripeCustomerId_key" ON "Auth"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "EmailUsage" ADD CONSTRAINT "EmailUsage_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
