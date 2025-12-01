-- DropForeignKey
ALTER TABLE "EmailJobResult" DROP CONSTRAINT "EmailJobResult_emailUserId_fkey";

-- DropForeignKey
ALTER TABLE "EmailSentHistory" DROP CONSTRAINT "EmailSentHistory_emailUserId_fkey";

-- AlterTable
ALTER TABLE "EmailJobResult" ADD COLUMN     "isNewsletter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "newsletterAuthId" INTEGER,
ALTER COLUMN "emailUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmailSentHistory" ADD COLUMN     "newsletterAuthId" INTEGER,
ALTER COLUMN "emailUserId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "EmailJobResult_newsletterAuthId_idx" ON "EmailJobResult"("newsletterAuthId");

-- CreateIndex
CREATE INDEX "EmailSentHistory_newsletterAuthId_idx" ON "EmailSentHistory"("newsletterAuthId");

-- AddForeignKey
ALTER TABLE "EmailJobResult" ADD CONSTRAINT "EmailJobResult_emailUserId_fkey" FOREIGN KEY ("emailUserId") REFERENCES "EmailUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailJobResult" ADD CONSTRAINT "EmailJobResult_newsletterAuthId_fkey" FOREIGN KEY ("newsletterAuthId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSentHistory" ADD CONSTRAINT "EmailSentHistory_emailUserId_fkey" FOREIGN KEY ("emailUserId") REFERENCES "EmailUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSentHistory" ADD CONSTRAINT "EmailSentHistory_newsletterAuthId_fkey" FOREIGN KEY ("newsletterAuthId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
