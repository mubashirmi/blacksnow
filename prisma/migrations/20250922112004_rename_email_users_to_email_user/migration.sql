/*
  Warnings:

  - You are about to drop the `emailUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "emailUsers" DROP CONSTRAINT "emailUsers_authId_fkey";

-- DropTable
DROP TABLE "emailUsers";

-- CreateTable
CREATE TABLE "EmailUser" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "EmailUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailUser_authId_idx" ON "EmailUser"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailUser_authId_email_key" ON "EmailUser"("authId", "email");

-- AddForeignKey
ALTER TABLE "EmailUser" ADD CONSTRAINT "EmailUser_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
