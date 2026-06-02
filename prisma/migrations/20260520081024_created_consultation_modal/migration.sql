/*
  Warnings:

  - You are about to drop the column `name` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Consultation` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidAt` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeCheckoutSessionId` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripePaymentIntentId` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Consultation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consultation" DROP COLUMN "name",
DROP COLUMN "title",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "stripeCheckoutSessionId" TEXT NOT NULL,
ADD COLUMN     "stripePaymentIntentId" TEXT NOT NULL,
ADD COLUMN     "totalAmount" INTEGER NOT NULL;
