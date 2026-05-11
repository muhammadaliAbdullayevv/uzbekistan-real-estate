DO $$
BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AuthSessionKind" AS ENUM ('USER', 'ADMIN_ENV');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER',
  ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "telegramUsername" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredDistrict" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredPropertyType" "PropertyType",
  ADD COLUMN IF NOT EXISTS "preferredRentType" "RentType",
  ADD COLUMN IF NOT EXISTS "preferredMinPrice" INTEGER,
  ADD COLUMN IF NOT EXISTS "preferredMaxPrice" INTEGER;

CREATE TABLE IF NOT EXISTS "FavoriteListing" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FavoriteListing_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FavoriteListing_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FavoriteListing_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ListingView" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingView_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ListingView_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ListingView_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "FavoriteListing_userId_listingId_key"
  ON "FavoriteListing"("userId", "listingId");

CREATE INDEX IF NOT EXISTS "FavoriteListing_userId_createdAt_idx"
  ON "FavoriteListing"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "FavoriteListing_listingId_idx"
  ON "FavoriteListing"("listingId");

CREATE INDEX IF NOT EXISTS "ListingView_userId_viewedAt_idx"
  ON "ListingView"("userId", "viewedAt");

CREATE INDEX IF NOT EXISTS "ListingView_listingId_viewedAt_idx"
  ON "ListingView"("listingId", "viewedAt");

CREATE TABLE IF NOT EXISTS "AuthSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "kind" "AuthSessionKind" NOT NULL,
  "email" TEXT,
  "userId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthSession_tokenHash_key"
  ON "AuthSession"("tokenHash");

CREATE INDEX IF NOT EXISTS "AuthSession_kind_expiresAt_idx"
  ON "AuthSession"("kind", "expiresAt");

CREATE INDEX IF NOT EXISTS "AuthSession_userId_expiresAt_idx"
  ON "AuthSession"("userId", "expiresAt");
