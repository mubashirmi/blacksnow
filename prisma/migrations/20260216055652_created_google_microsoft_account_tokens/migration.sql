-- CreateTable
CREATE TABLE "GoogleMicrosoftAccountTokens" (
    "id" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "GoogleMicrosoftAccountTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleMicrosoftAccountTokens_authId_idx" ON "GoogleMicrosoftAccountTokens"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleMicrosoftAccountTokens_provider_providerAccountId_key" ON "GoogleMicrosoftAccountTokens"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "GoogleMicrosoftAccountTokens" ADD CONSTRAINT "GoogleMicrosoftAccountTokens_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
