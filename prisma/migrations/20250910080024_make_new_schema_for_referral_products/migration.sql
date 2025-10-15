-- CreateTable
CREATE TABLE "ReferralProducts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "commision" INTEGER NOT NULL DEFAULT 0,
    "authId" INTEGER,

    CONSTRAINT "ReferralProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReferralProducts" ADD CONSTRAINT "ReferralProducts_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
