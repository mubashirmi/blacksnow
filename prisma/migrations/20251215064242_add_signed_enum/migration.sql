/*
  Warnings:

  - Changed the type of `signed` on the `Contract` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Signed" AS ENUM ('signed', 'notSigned', 'reject');

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "signed",
ADD COLUMN     "signed" "Signed" NOT NULL;
