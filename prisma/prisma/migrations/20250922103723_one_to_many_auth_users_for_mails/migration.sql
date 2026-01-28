/*
  Warnings:

  - You are about to drop the `usersForMails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "usersForMails" DROP CONSTRAINT "usersForMails_authId_fkey";

-- DropTable
DROP TABLE "usersForMails";
