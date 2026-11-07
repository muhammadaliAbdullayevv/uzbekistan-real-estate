-- CreateTable
CREATE TABLE IF NOT EXISTS "TelegramAuthAttempt" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT,
    "plainPass" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramAuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramAuthAttempt_tokenHash_key" ON "TelegramAuthAttempt"("tokenHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramAuthAttempt_tokenHash_idx" ON "TelegramAuthAttempt"("tokenHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelegramAuthAttempt_expiresAt_idx" ON "TelegramAuthAttempt"("expiresAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TelegramAuthAttempt_userId_fkey'
    ) THEN
        ALTER TABLE "TelegramAuthAttempt" ADD CONSTRAINT "TelegramAuthAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
