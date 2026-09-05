-- AlterTable
ALTER TABLE "Auth" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "EmailUsage" (
    "id" SERIAL NOT NULL,
    "authId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "billedOverage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmailUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailUsage_authId_month_key" ON "EmailUsage"("authId", "month");

-- AddForeignKey
ALTER TABLE "EmailUsage" ADD CONSTRAINT "EmailUsage_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
