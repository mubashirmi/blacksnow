-- Preserve existing contacts and imported lists as EmailMarketing data.
ALTER TABLE "EmailUser"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EmailMarketing';

ALTER TABLE "EmailUserCSV"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EmailMarketing';

-- The same recipient can now exist independently in each service.
DROP INDEX IF EXISTS "EmailUser_authId_email_key";

CREATE UNIQUE INDEX "EmailUser_authId_role_email_key"
ON "EmailUser"("authId", "role", "email");

CREATE INDEX "EmailUser_authId_role_idx"
ON "EmailUser"("authId", "role");

CREATE INDEX "EmailUserCSV_role_idx"
ON "EmailUserCSV"("role");
