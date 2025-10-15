/*
  Warnings:

  - You are about to drop the column `firstName` on the `emailUsers` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `emailUsers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emailUsers" DROP COLUMN "firstName",
ADD COLUMN     "fullName" TEXT NOT NULL;
