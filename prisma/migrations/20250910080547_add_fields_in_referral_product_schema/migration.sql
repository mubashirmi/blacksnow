/*
  Warnings:

  - Added the required column `productLink` to the `ReferralProducts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `ReferralProducts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReferralProducts" ADD COLUMN     "productLink" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL;
