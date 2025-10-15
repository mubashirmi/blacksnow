/*
  Warnings:

  - A unique constraint covering the columns `[authId,productLink]` on the table `ReferralProducts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `authId` on table `ReferralProducts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ReferralProducts" DROP CONSTRAINT "ReferralProducts_authId_fkey";

-- AlterTable
ALTER TABLE "ReferralProducts" ALTER COLUMN "authId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ReferralProducts_authId_idx" ON "ReferralProducts"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralProducts_authId_productLink_key" ON "ReferralProducts"("authId", "productLink");

-- AddForeignKey
ALTER TABLE "ReferralProducts" ADD CONSTRAINT "ReferralProducts_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
