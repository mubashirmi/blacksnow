-- CreateTable
CREATE TABLE "CheckoutRefund" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkoutId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "chargeAmount" INTEGER NOT NULL DEFAULT 0,
    "amountRefundedTotal" INTEGER NOT NULL DEFAULT 0,
    "remainingRefundable" INTEGER NOT NULL DEFAULT 0,
    "fullyRefunded" BOOLEAN NOT NULL DEFAULT false,
    "stripeRefundId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT NOT NULL,
    "sourceTransactionId" TEXT,
    "status" TEXT,
    "reason" TEXT,
    "failureReason" TEXT,
    "reverseTransfer" BOOLEAN NOT NULL DEFAULT true,
    "refundApplicationFee" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CheckoutRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutRefund_stripeRefundId_key" ON "CheckoutRefund"("stripeRefundId");

-- CreateIndex
CREATE INDEX "CheckoutRefund_checkoutId_idx" ON "CheckoutRefund"("checkoutId");

-- CreateIndex
CREATE INDEX "CheckoutRefund_stripePaymentIntentId_idx" ON "CheckoutRefund"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "CheckoutRefund_stripeChargeId_idx" ON "CheckoutRefund"("stripeChargeId");

-- CreateIndex
CREATE INDEX "CheckoutRefund_status_idx" ON "CheckoutRefund"("status");

-- AddForeignKey
ALTER TABLE "CheckoutRefund" ADD CONSTRAINT "CheckoutRefund_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
