/*
  Warnings:

  - The `adminStripeConnectIdStatus` column on the `Auth` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Auth" DROP COLUMN "adminStripeConnectIdStatus",
ADD COLUMN     "adminStripeConnectIdStatus" BOOLEAN DEFAULT false;
