ALTER TABLE "ActionVerification"
RENAME COLUMN "credentialsVerifiedAt" TO "otpSentAt";

ALTER TABLE "ActionVerification"
ALTER COLUMN "otpSentAt" SET DEFAULT CURRENT_TIMESTAMP;
