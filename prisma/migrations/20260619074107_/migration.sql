/*
  Warnings:

  - You are about to drop the column `paid` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "paid",
DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "image" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionId" TEXT;
