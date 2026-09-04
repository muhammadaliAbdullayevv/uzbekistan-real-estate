-- CreateEnum
CREATE TYPE "LocationPrecision" AS ENUM ('EXACT', 'APPROXIMATE');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationPrecision" "LocationPrecision" NOT NULL DEFAULT 'APPROXIMATE',
ADD COLUMN     "longitude" DOUBLE PRECISION;
