/*
  Warnings:

  - The `signed` column on the `Contract` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "signed",
ADD COLUMN     "signed" TEXT NOT NULL DEFAULT 'notSigned';

-- DropEnum
DROP TYPE "Signed";
