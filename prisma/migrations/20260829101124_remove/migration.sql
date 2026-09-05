/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Auth` table. All the data in the column will be lost.
  - You are about to drop the `EmailUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmailUsage" DROP CONSTRAINT "EmailUsage_authId_fkey";

-- AlterTable
ALTER TABLE "Auth" DROP COLUMN "stripeCustomerId";

-- DropTable
DROP TABLE "EmailUsage";
