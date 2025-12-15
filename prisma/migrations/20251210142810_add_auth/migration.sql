-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "authId" INTEGER;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
