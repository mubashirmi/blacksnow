-- CreateTable
CREATE TABLE "ToolFeedback" (
    "authId" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "stars" TEXT NOT NULL,
    "toolName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ToolFeedback_authId_key" ON "ToolFeedback"("authId");

-- AddForeignKey
ALTER TABLE "ToolFeedback" ADD CONSTRAINT "ToolFeedback_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
