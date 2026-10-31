-- Add a separate user-notes table without changing or removing existing notes.
CREATE TABLE "NotesForUsers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT,
    "authId" INTEGER NOT NULL,

    CONSTRAINT "NotesForUsers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "NotesForUsers"
ADD CONSTRAINT "NotesForUsers_authId_fkey"
FOREIGN KEY ("authId") REFERENCES "Auth"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
