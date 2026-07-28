/*
  Warnings:

  - You are about to drop the column `image` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `SubscriptionInv` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "image",
ADD COLUMN     "paidImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "unpaidImage" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SubscriptionInv" DROP COLUMN "image",
ADD COLUMN     "paidImage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "unpaidImage" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "paymentType" SET DEFAULT 'subscription';
