-- Preserve all existing credentials, jobs, and history as EmailMarketing.
ALTER TABLE "emailMarketingCredentials"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EmailMarketing';

ALTER TABLE "EmailJobResult"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EmailMarketing';

ALTER TABLE "EmailSentHistory"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EmailMarketing';

-- A user can configure one independent sender for each supported service.
DROP INDEX IF EXISTS "emailMarketingCredentials_authId_key";

CREATE UNIQUE INDEX "emailMarketingCredentials_authId_role_key"
ON "emailMarketingCredentials"("authId", "role");

CREATE INDEX "emailMarketingCredentials_authId_idx"
ON "emailMarketingCredentials"("authId");

CREATE INDEX "EmailJobResult_authId_role_idx"
ON "EmailJobResult"("authId", "role");

CREATE INDEX "EmailSentHistory_authId_role_sentAt_idx"
ON "EmailSentHistory"("authId", "role", "sentAt");
