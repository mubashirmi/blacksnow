-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionId" TEXT;
