/*
  Warnings:

  - A unique constraint covering the columns `[authId,email]` on the table `usersForMails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usersForMails_authId_email_key" ON "usersForMails"("authId", "email");
