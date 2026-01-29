-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Affiliate', 'Sales', 'Admin');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Job', 'Recruitment');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Approved', 'NotApproved', 'Rejected');

-- CreateTable
CREATE TABLE "Auth" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "adminStripeConnectId" TEXT,
    "referredById" INTEGER,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "cognitoId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "roleId" INTEGER NOT NULL,
    "disabled" BOOLEAN NOT NULL,
    "digitalBillboards" INTEGER NOT NULL DEFAULT 0,
    "pageHits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignUp" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "calendarId" INTEGER NOT NULL,
    "affiliateId" INTEGER,

    CONSTRAINT "SignUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calendar" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "limit" INTEGER,
    "compareDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBroughtProducts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "roleId" INTEGER NOT NULL,
    "disabled" BOOLEAN NOT NULL,

    CONSTRAINT "UserBroughtProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsLetter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "NewsLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsLetterContent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "NewsLetterContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkout" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "transactionId" TEXT,
    "AuthId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "product" TEXT NOT NULL,
    "cancelSubscripton" BOOLEAN NOT NULL,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequentQuestions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "FrequentQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL,
    "link" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "digitalBillboards" INTEGER NOT NULL DEFAULT 0,
    "pageHits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Careers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "description" TEXT,
    "location" TEXT,
    "salary" INTEGER,
    "image" TEXT,
    "type" "Type" NOT NULL,

    CONSTRAINT "Careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicants" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "careersId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "resume" TEXT NOT NULL,

    CONSTRAINT "Applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "numOfPositions" INTEGER NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blogpost" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "postContent" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "headerImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Blogpost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "AuthId" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN,
    "userId" INTEGER NOT NULL,
    "website" TEXT,
    "twitter" TEXT,
    "youtube" TEXT,
    "facebook" TEXT,
    "linkedIn" TEXT,
    "instagram" TEXT,
    "businessImage" TEXT,
    "companyName" TEXT,
    "podcast" TEXT,
    "companyBlurb" TEXT,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Legal" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "Legal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateAgreement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "affiliateAgreement" TEXT NOT NULL,

    CONSTRAINT "AffiliateAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gdpr" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gdpr" TEXT NOT NULL,

    CONSTRAINT "Gdpr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terms" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "terms" TEXT NOT NULL,

    CONSTRAINT "Terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskDisclosure" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "riskDisclosure" TEXT NOT NULL,

    CONSTRAINT "RiskDisclosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyPolicy" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "privacyPolicy" TEXT NOT NULL,

    CONSTRAINT "PrivacyPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalBillboard" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "podcast" TEXT NOT NULL,
    "twitter" TEXT NOT NULL,
    "youTube" TEXT NOT NULL,
    "facebook" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "authId" INTEGER,

    CONSTRAINT "DigitalBillboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_adminStripeConnectId_key" ON "Auth"("adminStripeConnectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoId_key" ON "User"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserBroughtProducts_email_key" ON "UserBroughtProducts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_userId_key" ON "Affiliate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Blogpost_slug_key" ON "Blogpost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_AuthId_key" ON "Subscription"("AuthId");

-- CreateIndex
CREATE UNIQUE INDEX "Advertiser_userId_key" ON "Advertiser"("userId");

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignUp" ADD CONSTRAINT "SignUp_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignUp" ADD CONSTRAINT "SignUp_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignUp" ADD CONSTRAINT "SignUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_AuthId_fkey" FOREIGN KEY ("AuthId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicants" ADD CONSTRAINT "Applicants_careersId_fkey" FOREIGN KEY ("careersId") REFERENCES "Careers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_AuthId_fkey" FOREIGN KEY ("AuthId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertiser" ADD CONSTRAINT "Advertiser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalBillboard" ADD CONSTRAINT "DigitalBillboard_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
