-- CreateTable
CREATE TABLE "DigitalBillboardClick" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billboardId" INTEGER NOT NULL,

    CONSTRAINT "DigitalBillboardClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DigitalBillboard_authId_createdAt_idx"
ON "DigitalBillboard"("authId", "createdAt");

-- CreateIndex
CREATE INDEX "DigitalBillboardClick_billboardId_createdAt_idx"
ON "DigitalBillboardClick"("billboardId", "createdAt");

-- CreateIndex
CREATE INDEX "DigitalBillboardClick_createdAt_idx"
ON "DigitalBillboardClick"("createdAt");

-- AddForeignKey
ALTER TABLE "DigitalBillboardClick"
ADD CONSTRAINT "DigitalBillboardClick_billboardId_fkey"
FOREIGN KEY ("billboardId") REFERENCES "DigitalBillboard"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
