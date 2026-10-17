-- Extend legacy legal-document tables without breaking their existing APIs.
ALTER TABLE "AffiliateAgreement"
    ALTER COLUMN "affiliateAgreement" SET DEFAULT '',
    ADD COLUMN "content" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "summary" TEXT NOT NULL DEFAULT '';

UPDATE "AffiliateAgreement"
SET "content" = "affiliateAgreement"
WHERE "content" = '' AND "affiliateAgreement" <> '';

ALTER TABLE "Gdpr"
    ALTER COLUMN "gdpr" SET DEFAULT '',
    ADD COLUMN "content" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "summary" TEXT NOT NULL DEFAULT '';

UPDATE "Gdpr"
SET "content" = "gdpr"
WHERE "content" = '' AND "gdpr" <> '';

ALTER TABLE "Terms"
    ALTER COLUMN "terms" SET DEFAULT '',
    ADD COLUMN "content" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "summary" TEXT NOT NULL DEFAULT '';

UPDATE "Terms"
SET "content" = "terms"
WHERE "content" = '' AND "terms" <> '';

ALTER TABLE "PrivacyPolicy"
    ALTER COLUMN "privacyPolicy" SET DEFAULT '',
    ADD COLUMN "content" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "summary" TEXT NOT NULL DEFAULT '';

UPDATE "PrivacyPolicy"
SET "content" = "privacyPolicy"
WHERE "content" = '' AND "privacyPolicy" <> '';

-- CreateTable
CREATE TABLE "MarketDataDisclosure" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketDataDisclosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependentContract" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependentContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoFinancialAdvice" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoFinancialAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPolicy" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarningsDisclosure" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EarningsDisclosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookiePolicy" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookiePolicy_pkey" PRIMARY KEY ("id")
);
