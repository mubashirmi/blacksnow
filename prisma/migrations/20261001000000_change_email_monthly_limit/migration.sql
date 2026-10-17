-- Change the standard monthly email allowance without modifying custom limits
-- or immutable snapshots for months that have already started.
ALTER TABLE "Auth" ALTER COLUMN "emailUsageLimit" SET DEFAULT 50000;
ALTER TABLE "EmailUsage" ALTER COLUMN "includedLimit" SET DEFAULT 50000;

UPDATE "Auth"
SET "emailUsageLimit" = 50000
WHERE "emailUsageLimit" = 100000;
