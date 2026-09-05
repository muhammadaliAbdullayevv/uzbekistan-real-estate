/*
  Warnings:

  - You are about to drop the `FavoriteListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteListing" DROP CONSTRAINT "FavoriteListing_listingId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteListing" DROP CONSTRAINT "FavoriteListing_userId_fkey";

-- DropTable
DROP TABLE "FavoriteListing";
