-- AlterEnum
ALTER TYPE "UserTokenType" ADD VALUE 'PHONE_VERIFY';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "telegramChatId" TEXT;
