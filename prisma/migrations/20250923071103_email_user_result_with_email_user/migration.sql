/*
  Warnings:

  - Added the required column `emailUserId` to the `EmailJobResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailJobResult" ADD COLUMN     "emailUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailJobResult" ADD CONSTRAINT "EmailJobResult_emailUserId_fkey" FOREIGN KEY ("emailUserId") REFERENCES "EmailUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
