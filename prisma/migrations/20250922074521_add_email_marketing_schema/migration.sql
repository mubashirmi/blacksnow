-- CreateTable
CREATE TABLE "emailMarketingCredentials" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "appPassword" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "emailMarketingCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emailMarketingCredentials_authId_key" ON "emailMarketingCredentials"("authId");

-- AddForeignKey
ALTER TABLE "emailMarketingCredentials" ADD CONSTRAINT "emailMarketingCredentials_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
