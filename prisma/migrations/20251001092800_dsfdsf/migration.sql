/*
  Warnings:

  - A unique constraint covering the columns `[authId]` on the table `AdminRevenue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdminRevenue_authId_key" ON "AdminRevenue"("authId");
