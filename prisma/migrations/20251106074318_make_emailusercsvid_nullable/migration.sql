-- AlterTable
ALTER TABLE "EmailUser" ADD COLUMN     "emailUserCSVId" INTEGER;

-- CreateTable
CREATE TABLE "EmailUserCSV" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EmailUserCSV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailUser_emailUserCSVId_idx" ON "EmailUser"("emailUserCSVId");

-- AddForeignKey
ALTER TABLE "EmailUser" ADD CONSTRAINT "EmailUser_emailUserCSVId_fkey" FOREIGN KEY ("emailUserCSVId") REFERENCES "EmailUserCSV"("id") ON DELETE SET NULL ON UPDATE CASCADE;
