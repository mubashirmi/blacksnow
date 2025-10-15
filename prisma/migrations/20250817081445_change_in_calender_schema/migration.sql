/*
  Warnings:

  - You are about to drop the column `authId` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `userBroughtProductsId` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `calendarId` on the `SignUp` table. All the data in the column will be lost.
  - You are about to drop the column `disabled` on the `UserBroughtProducts` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `UserBroughtProducts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[calendarId]` on the table `UserBroughtProducts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `calendarId` to the `UserBroughtProducts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_authId_fkey";

-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_userBroughtProductsId_fkey";

-- DropForeignKey
ALTER TABLE "SignUp" DROP CONSTRAINT "SignUp_calendarId_fkey";

-- DropIndex
DROP INDEX "Calendar_userBroughtProductsId_key";

-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "authId",
DROP COLUMN "deleted",
DROP COLUMN "userBroughtProductsId";

-- AlterTable
ALTER TABLE "SignUp" DROP COLUMN "calendarId";

-- AlterTable
ALTER TABLE "UserBroughtProducts" DROP COLUMN "disabled",
DROP COLUMN "roleId",
ADD COLUMN     "calendarId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserBroughtProducts_calendarId_key" ON "UserBroughtProducts"("calendarId");

-- AddForeignKey
ALTER TABLE "UserBroughtProducts" ADD CONSTRAINT "UserBroughtProducts_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
