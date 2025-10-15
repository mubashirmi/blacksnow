/*
  Warnings:

  - You are about to drop the column `commission` on the `ReferralProducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReferralProducts" DROP COLUMN "commission",
ADD COLUMN     "comission" INTEGER NOT NULL DEFAULT 0;
