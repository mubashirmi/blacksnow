/*
  Warnings:

  - The `timeInterval` column on the `EmailJobResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "EmailJobResult" DROP COLUMN "timeInterval",
ADD COLUMN     "timeInterval" INTEGER;
