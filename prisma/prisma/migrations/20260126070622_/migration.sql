-- CreateTable
CREATE TABLE "ReferralProductsClicks" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "referralProductsId" INTEGER NOT NULL,

    CONSTRAINT "ReferralProductsClicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReferralProductsClicks" ADD CONSTRAINT "ReferralProductsClicks_referralProductsId_fkey" FOREIGN KEY ("referralProductsId") REFERENCES "ReferralProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
