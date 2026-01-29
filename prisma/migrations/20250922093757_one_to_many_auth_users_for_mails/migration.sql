-- CreateTable
CREATE TABLE "usersForMails" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "usersForMails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usersForMails_authId_idx" ON "usersForMails"("authId");

-- AddForeignKey
ALTER TABLE "usersForMails" ADD CONSTRAINT "usersForMails_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
