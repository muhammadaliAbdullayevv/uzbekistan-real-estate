-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('UNFURNISHED', 'PARTIAL', 'FURNISHED');

-- AlterEnum
ALTER TYPE "PropertyType" ADD VALUE 'studio';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "furnishing" "FurnishingStatus";
