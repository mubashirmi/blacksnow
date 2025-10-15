-- CreateTable
CREATE TABLE "AdminPayouts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" TEXT NOT NULL,
    "adminStripeConnectId" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "AdminPayouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminPayouts" ADD CONSTRAINT "AdminPayouts_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
