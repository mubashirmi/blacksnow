-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "applicationFeeAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "baseAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "platformFeeAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "refunded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refundedAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "serviceFeeAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serviceFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 3,
ADD COLUMN     "stripeLatestRefundId" TEXT,
ADD COLUMN     "stripeRefundStatus" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "paymentType" TEXT NOT NULL DEFAULT 'one_time',
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "baseAmount" INTEGER NOT NULL DEFAULT 0,
    "serviceFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "platformFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "applicationFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "paymentStatus" TEXT,
    "paidAt" TIMESTAMP(3),
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRefund" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "invoicePaymentId" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "stripeRefundId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT,
    "reason" TEXT,
    "reverseTransfer" BOOLEAN NOT NULL DEFAULT true,
    "refundApplicationFee" BOOLEAN NOT NULL DEFAULT true,
    "cancelSubscription" BOOLEAN NOT NULL DEFAULT false,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdByAuthId" INTEGER,

    CONSTRAINT "InvoiceRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoicePayment_stripePaymentIntentId_key" ON "InvoicePayment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "InvoicePayment_invoiceId_idx" ON "InvoicePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePayment_stripeSubscriptionId_idx" ON "InvoicePayment"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "InvoicePayment_stripeInvoiceId_idx" ON "InvoicePayment"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "InvoicePayment_stripeChargeId_idx" ON "InvoicePayment"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRefund_stripeRefundId_key" ON "InvoiceRefund"("stripeRefundId");

-- CreateIndex
CREATE INDEX "InvoiceRefund_invoiceId_idx" ON "InvoiceRefund"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceRefund_invoicePaymentId_idx" ON "InvoiceRefund"("invoicePaymentId");

-- CreateIndex
CREATE INDEX "InvoiceRefund_stripePaymentIntentId_idx" ON "InvoiceRefund"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "InvoiceRefund_stripeChargeId_idx" ON "InvoiceRefund"("stripeChargeId");

-- CreateIndex
CREATE INDEX "Invoice_stripePaymentIntentId_idx" ON "Invoice"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRefund" ADD CONSTRAINT "InvoiceRefund_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRefund" ADD CONSTRAINT "InvoiceRefund_invoicePaymentId_fkey" FOREIGN KEY ("invoicePaymentId") REFERENCES "InvoicePayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
