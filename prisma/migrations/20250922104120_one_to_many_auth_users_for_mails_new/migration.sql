-- CreateTable
CREATE TABLE "emailUsers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "emailUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emailUsers_authId_idx" ON "emailUsers"("authId");

-- AddForeignKey
ALTER TABLE "emailUsers" ADD CONSTRAINT "emailUsers_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
