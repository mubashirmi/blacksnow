/*
  Warnings:

  - Added the required column `updatedAt` to the `ToolFeedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ToolFeedback_authId_key";

-- AlterTable
ALTER TABLE "ToolFeedback" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "ToolFeedback_pkey" PRIMARY KEY ("id");
