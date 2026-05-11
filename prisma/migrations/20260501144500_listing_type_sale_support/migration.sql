ALTER TABLE "Listing"
ADD COLUMN "listingType" TEXT NOT NULL DEFAULT 'rent';

ALTER TABLE "Listing"
ALTER COLUMN "rentType" DROP NOT NULL;

ALTER TABLE "Listing"
ALTER COLUMN "rentType" SET DEFAULT 'monthly';

UPDATE "Listing"
SET "listingType" = 'rent'
WHERE "listingType" IS NULL;

UPDATE "Listing"
SET "rentType" = 'monthly'
WHERE "listingType" = 'rent' AND "rentType" IS NULL;

ALTER TABLE "Listing"
ADD CONSTRAINT "Listing_listingType_check"
CHECK ("listingType" IN ('rent', 'sale'));

CREATE INDEX "Listing_listingType_idx" ON "Listing"("listingType");
