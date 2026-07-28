-- CreateTable
CREATE TABLE "SubscriptionInv" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "businessName" TEXT NOT NULL DEFAULT '',
    "price" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "transactionId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paymentType" TEXT NOT NULL DEFAULT 'one_time',
    "subscriptionInterval" TEXT NOT NULL DEFAULT 'month',
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "baseAmount" INTEGER NOT NULL DEFAULT 0,
    "serviceFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "serviceFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "platformFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "applicationFeeAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeLatestInvoiceId" TEXT,
    "stripeSubscriptionStatus" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "stripeCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionStartedAt" TIMESTAMP(3),
    "subscriptionCanceledAt" TIMESTAMP(3),
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAmount" INTEGER NOT NULL DEFAULT 0,
    "stripeLatestRefundId" TEXT,
    "stripeRefundStatus" TEXT,
    "refundedAt" TIMESTAMP(3),
    "contractId" INTEGER,
    "authId" INTEGER,

    CONSTRAINT "SubscriptionInv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionInvPayment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionInvId" INTEGER NOT NULL,
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

    CONSTRAINT "SubscriptionInvPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionInvRefund" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionInvId" INTEGER NOT NULL,
    "subscriptionInvPaymentId" INTEGER,
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

    CONSTRAINT "SubscriptionInvRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionInv_paymentType_idx" ON "SubscriptionInv"("paymentType");

-- CreateIndex
CREATE INDEX "SubscriptionInv_stripeCheckoutSessionId_idx" ON "SubscriptionInv"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "SubscriptionInv_stripePaymentIntentId_idx" ON "SubscriptionInv"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "SubscriptionInv_stripeSubscriptionId_idx" ON "SubscriptionInv"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionInv_stripeCustomerId_idx" ON "SubscriptionInv"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionInvPayment_stripePaymentIntentId_key" ON "SubscriptionInvPayment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "SubscriptionInvPayment_subscriptionInvId_idx" ON "SubscriptionInvPayment"("subscriptionInvId");

-- CreateIndex
CREATE INDEX "SubscriptionInvPayment_stripeSubscriptionId_idx" ON "SubscriptionInvPayment"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionInvPayment_stripeInvoiceId_idx" ON "SubscriptionInvPayment"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "SubscriptionInvPayment_stripeChargeId_idx" ON "SubscriptionInvPayment"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionInvRefund_stripeRefundId_key" ON "SubscriptionInvRefund"("stripeRefundId");

-- CreateIndex
CREATE INDEX "SubscriptionInvRefund_subscriptionInvId_idx" ON "SubscriptionInvRefund"("subscriptionInvId");

-- CreateIndex
CREATE INDEX "SubscriptionInvRefund_subscriptionInvPaymentId_idx" ON "SubscriptionInvRefund"("subscriptionInvPaymentId");

-- CreateIndex
CREATE INDEX "SubscriptionInvRefund_stripePaymentIntentId_idx" ON "SubscriptionInvRefund"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "SubscriptionInvRefund_stripeChargeId_idx" ON "SubscriptionInvRefund"("stripeChargeId");

-- AddForeignKey
ALTER TABLE "SubscriptionInv" ADD CONSTRAINT "SubscriptionInv_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionInv" ADD CONSTRAINT "SubscriptionInv_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionInvPayment" ADD CONSTRAINT "SubscriptionInvPayment_subscriptionInvId_fkey" FOREIGN KEY ("subscriptionInvId") REFERENCES "SubscriptionInv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionInvRefund" ADD CONSTRAINT "SubscriptionInvRefund_subscriptionInvId_fkey" FOREIGN KEY ("subscriptionInvId") REFERENCES "SubscriptionInv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionInvRefund" ADD CONSTRAINT "SubscriptionInvRefund_subscriptionInvPaymentId_fkey" FOREIGN KEY ("subscriptionInvPaymentId") REFERENCES "SubscriptionInvPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
