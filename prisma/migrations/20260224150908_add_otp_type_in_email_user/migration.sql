/*
  Warnings:

  - You are about to drop the column `optType` on the `Auth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auth" DROP COLUMN "optType";

-- AlterTable
ALTER TABLE "EmailUser" ADD COLUMN     "optType" TEXT NOT NULL DEFAULT 'default';
