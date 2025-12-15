/*
  Warnings:

  - You are about to drop the column `authId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `pdf` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `signed` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_authId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "authId",
DROP COLUMN "pdf",
DROP COLUMN "signed",
ADD COLUMN     "contractId" INTEGER,
ADD COLUMN     "price" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "businessName" TEXT NOT NULL DEFAULT '',
    "pdf" TEXT NOT NULL,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "authId" INTEGER,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
