-- CreateTable
CREATE TABLE "EmailJobResult" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messageId" TEXT,
    "error" TEXT,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "EmailJobResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailJobResult_jobId_idx" ON "EmailJobResult"("jobId");

-- AddForeignKey
ALTER TABLE "EmailJobResult" ADD CONSTRAINT "EmailJobResult_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
