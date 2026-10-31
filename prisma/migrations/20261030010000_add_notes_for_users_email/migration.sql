-- Preserve existing notes while adding the recipient email snapshot.
ALTER TABLE "NotesForUsers" ADD COLUMN "email" TEXT;

UPDATE "NotesForUsers" AS note
SET "email" = auth."email"
FROM "Auth" AS auth
WHERE note."authId" = auth."id";

ALTER TABLE "NotesForUsers" ALTER COLUMN "email" SET NOT NULL;
