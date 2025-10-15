/*
  Warnings:

  - You are about to drop the column `error` on the `EmailJobResult` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `EmailJobResult` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `EmailJobResult` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `EmailJobResult` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EmailJobResult` table. All the data in the column will be lost.
  - Added the required column `runAt` to the `EmailJobResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `EmailJobResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `EmailJobResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailJobResult_jobId_idx";

-- AlterTable
ALTER TABLE "EmailJobResult" DROP COLUMN "error",
DROP COLUMN "messageId",
DROP COLUMN "status",
DROP COLUMN "userEmail",
DROP COLUMN "userId",
ADD COLUMN     "runAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "EmailJobResult_authId_idx" ON "EmailJobResult"("authId");

-- CreateIndex
CREATE INDEX "EmailJobResult_emailUserId_idx" ON "EmailJobResult"("emailUserId");
