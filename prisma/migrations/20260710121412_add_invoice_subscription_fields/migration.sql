-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentType" TEXT NOT NULL DEFAULT 'one_time',
ADD COLUMN     "stripeCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeLatestInvoiceId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "stripeSubscriptionStatus" TEXT,
ADD COLUMN     "subscriptionCanceledAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionInterval" TEXT NOT NULL DEFAULT 'month',
ADD COLUMN     "subscriptionStartedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Invoice_paymentType_idx" ON "Invoice"("paymentType");

-- CreateIndex
CREATE INDEX "Invoice_stripeCheckoutSessionId_idx" ON "Invoice"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Invoice_stripeSubscriptionId_idx" ON "Invoice"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Invoice_stripeCustomerId_idx" ON "Invoice"("stripeCustomerId");
