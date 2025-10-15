/*
  Warnings:

  - You are about to drop the `Commission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_referralId_fkey";

-- DropForeignKey
ALTER TABLE "Conversions" DROP CONSTRAINT "Conversions_referralId_fkey";

-- AlterTable
ALTER TABLE "ReferralProducts" ADD COLUMN     "commission" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "conversion" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Commission";

-- DropTable
DROP TABLE "Conversions";
