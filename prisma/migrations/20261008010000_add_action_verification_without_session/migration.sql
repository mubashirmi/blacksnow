CREATE TABLE "ActionVerification" (
    "id" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "contextHash" TEXT NOT NULL,
    "challengeSecretHash" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "sendCount" INTEGER NOT NULL DEFAULT 1,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credentialsVerifiedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verificationTokenHash" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionVerification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActionVerificationAttempt" (
    "id" TEXT NOT NULL,
    "identifierHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionVerificationAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActionVerification_verificationTokenHash_key" ON "ActionVerification"("verificationTokenHash");
CREATE INDEX "ActionVerification_authId_action_createdAt_idx" ON "ActionVerification"("authId", "action", "createdAt");
CREATE INDEX "ActionVerification_expiresAt_idx" ON "ActionVerification"("expiresAt");
CREATE INDEX "ActionVerificationAttempt_identifierHash_createdAt_idx" ON "ActionVerificationAttempt"("identifierHash", "createdAt");

ALTER TABLE "ActionVerification"
ADD CONSTRAINT "ActionVerification_authId_fkey"
FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
