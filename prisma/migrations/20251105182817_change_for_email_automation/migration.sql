-- AlterTable
ALTER TABLE "EmailJobResult" ADD COLUMN     "html" TEXT,
ADD COLUMN     "rotationSpanSeconds" INTEGER,
ADD COLUMN     "weekdays" INTEGER[],
ALTER COLUMN "text" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "EmailJobResult_status_runAt_idx" ON "EmailJobResult"("status", "runAt");
