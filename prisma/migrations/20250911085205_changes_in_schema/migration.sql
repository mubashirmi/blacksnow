/*
  Warnings:

  - You are about to drop the column `commision` on the `ReferralProducts` table. All the data in the column will be lost.
  - You are about to drop the column `conversions` on the `ReferralProducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReferralProducts" DROP COLUMN "commision",
DROP COLUMN "conversions";

-- CreateTable
CREATE TABLE "Conversions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversionCount" INTEGER NOT NULL,
    "referralId" INTEGER NOT NULL,

    CONSTRAINT "Conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Commission" INTEGER NOT NULL,
    "referralId" INTEGER NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversions_referralId_key" ON "Conversions"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_referralId_key" ON "Commission"("referralId");

-- AddForeignKey
ALTER TABLE "Conversions" ADD CONSTRAINT "Conversions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "ReferralProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "ReferralProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
