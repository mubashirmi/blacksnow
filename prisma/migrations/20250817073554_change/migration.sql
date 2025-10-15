/*
  Warnings:

  - A unique constraint covering the columns `[userBroughtProductsId]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "authId" INTEGER,
ADD COLUMN     "userBroughtProductsId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_userBroughtProductsId_key" ON "Calendar"("userBroughtProductsId");

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_userBroughtProductsId_fkey" FOREIGN KEY ("userBroughtProductsId") REFERENCES "UserBroughtProducts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
