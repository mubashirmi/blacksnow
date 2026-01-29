/*
  Warnings:

  - You are about to drop the column `repeated` on the `EmailUser` table. All the data in the column will be lost.
  - Added the required column `time` to the `EmailJobResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailJobResult" ADD COLUMN     "repeated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "time" TIME(0) NOT NULL;

-- AlterTable
ALTER TABLE "EmailUser" DROP COLUMN "repeated";
