CREATE TYPE "ListingAvailabilityStatus" AS ENUM ('ACTIVE', 'RENTED', 'SOLD');

CREATE TYPE "UserTokenType" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

ALTER TABLE "User"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

UPDATE "User"
SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW());

ALTER TABLE "Listing"
ADD COLUMN "availabilityStatus" "ListingAvailabilityStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "Listing_availabilityStatus_idx" ON "Listing"("availabilityStatus");

CREATE TABLE "UserToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "type" "UserTokenType" NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserToken_tokenHash_key" ON "UserToken"("tokenHash");
CREATE INDEX "UserToken_userId_type_idx" ON "UserToken"("userId", "type");
CREATE INDEX "UserToken_type_expiresAt_idx" ON "UserToken"("type", "expiresAt");

ALTER TABLE "UserToken"
ADD CONSTRAINT "UserToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
