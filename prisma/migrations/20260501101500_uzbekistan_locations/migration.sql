ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "preferredRegion" TEXT;

ALTER TABLE "Listing"
ADD COLUMN IF NOT EXISTS "region" TEXT NOT NULL DEFAULT 'Tashkent Region',
ADD COLUMN IF NOT EXISTS "city" TEXT;

CREATE INDEX IF NOT EXISTS "Listing_region_idx" ON "Listing"("region");
CREATE INDEX IF NOT EXISTS "Listing_city_idx" ON "Listing"("city");
CREATE INDEX IF NOT EXISTS "Listing_region_district_idx" ON "Listing"("region", "district");
