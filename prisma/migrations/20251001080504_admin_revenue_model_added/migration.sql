-- CreateTable
CREATE TABLE "AdminRevenue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revenue" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "AdminRevenue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminRevenue" ADD CONSTRAINT "AdminRevenue_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
