/**
 * One-off data backfill: assigns an APPROXIMATE latitude/longitude (district
 * or region centroid, see lib/district-coordinates.ts) to listings created
 * before the map location picker existed, so they still show up in "near me"
 * search. Never touches a listing that already has coordinates (i.e. never
 * overwrites a real, submitter-placed EXACT pin).
 *
 * Defaults to a dry run (prints what WOULD change). Pass --apply to write.
 *
 * Usage:
 *   npx tsx scripts/backfill-listing-locations.ts            # dry run
 *   npx tsx scripts/backfill-listing-locations.ts --apply     # writes changes
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { getDistrictCentroid } from "../lib/district-coordinates";

const prisma = new PrismaClient();

async function main() {
  const apply = process.argv.includes("--apply");

  const listings = await prisma.$queryRaw<
    { id: string; title: string; region: string; district: string }[]
  >`
    SELECT "id", "title", "region", "district"
    FROM "Listing"
    WHERE "latitude" IS NULL OR "longitude" IS NULL
  `;

  const toUpdate: { id: string; title: string; lat: number; lng: number }[] = [];
  const unmatched: { id: string; title: string; region: string; district: string }[] = [];

  for (const listing of listings) {
    const point = getDistrictCentroid(listing.region, listing.district);

    if (point) {
      toUpdate.push({ id: listing.id, title: listing.title, lat: point.lat, lng: point.lng });
    } else {
      unmatched.push(listing);
    }
  }

  console.log(`Listings missing coordinates: ${listings.length}`);
  console.log(`Will backfill (district/region centroid found): ${toUpdate.length}`);
  console.log(`Unmatched (no region/district centroid, skipped): ${unmatched.length}`);
  console.log("");

  if (unmatched.length > 0) {
    console.log("--- UNMATCHED (review manually) ---");
    for (const item of unmatched) {
      console.log(`[${item.region}] "${item.district}"  (listing: ${item.title}, id=${item.id})`);
    }
    console.log("");
  }

  if (!apply) {
    console.log(`DRY RUN — no changes written. Re-run with --apply to backfill the ${toUpdate.length} matches.`);
    return;
  }

  console.log(`Applying ${toUpdate.length} updates...`);
  for (const item of toUpdate) {
    await prisma.$executeRaw`
      UPDATE "Listing"
      SET "latitude" = ${item.lat}, "longitude" = ${item.lng}
      WHERE "id" = ${item.id} AND ("latitude" IS NULL OR "longitude" IS NULL)
    `;
  }
  console.log("Done.");
}

main().finally(() => prisma.$disconnect());
