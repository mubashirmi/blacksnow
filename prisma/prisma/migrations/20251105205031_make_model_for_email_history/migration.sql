-- CreateTable
CREATE TABLE "EmailSentHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "subject" TEXT NOT NULL,
    "text" TEXT,
    "html" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'sent',
    "messageId" TEXT,
    "errorMessage" TEXT,
    "authId" INTEGER NOT NULL,
    "emailUserId" INTEGER NOT NULL,
    "credentialsId" INTEGER,
    "jobResultId" TEXT,

    CONSTRAINT "EmailSentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailSentHistory_authId_idx" ON "EmailSentHistory"("authId");

-- CreateIndex
CREATE INDEX "EmailSentHistory_emailUserId_idx" ON "EmailSentHistory"("emailUserId");

-- CreateIndex
CREATE INDEX "EmailSentHistory_credentialsId_idx" ON "EmailSentHistory"("credentialsId");

-- CreateIndex
CREATE INDEX "EmailSentHistory_jobResultId_idx" ON "EmailSentHistory"("jobResultId");

-- CreateIndex
CREATE INDEX "EmailSentHistory_status_idx" ON "EmailSentHistory"("status");

-- AddForeignKey
ALTER TABLE "EmailSentHistory" ADD CONSTRAINT "EmailSentHistory_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSentHistory" ADD CONSTRAINT "EmailSentHistory_emailUserId_fkey" FOREIGN KEY ("emailUserId") REFERENCES "EmailUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSentHistory" ADD CONSTRAINT "EmailSentHistory_credentialsId_fkey" FOREIGN KEY ("credentialsId") REFERENCES "emailMarketingCredentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSentHistory" ADD CONSTRAINT "EmailSentHistory_jobResultId_fkey" FOREIGN KEY ("jobResultId") REFERENCES "EmailJobResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
