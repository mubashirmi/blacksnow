/*
  Warnings:

  - Added the required column `calendarId` to the `SignUp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SignUp" ADD COLUMN     "calendarId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SignUp" ADD CONSTRAINT "SignUp_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
