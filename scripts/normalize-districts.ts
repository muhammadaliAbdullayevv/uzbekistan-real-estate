/**
 * One-off data cleanup: matches each listing's free-text `district` value
 * against the canonical UZBEKISTAN_DISTRICTS list (see lib/locations.ts) and,
 * where a confident match is found, rewrites it to the canonical spelling so
 * the add-listing form's district dropdown (which only accepts canonical
 * values going forward) reflects existing data correctly.
 *
 * Defaults to a dry run (prints what WOULD change). Pass --apply to write.
 *
 * Usage:
 *   npx tsx scripts/normalize-districts.ts            # dry run
 *   npx tsx scripts/normalize-districts.ts --apply     # writes changes
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { UZBEKISTAN_DISTRICTS, isUzbekistanRegion } from "../lib/locations";

const prisma = new PrismaClient();

function baseStem(value: string) {
  return value
    .toLowerCase()
    .replace(/[‘’′']/g, "") // strip tutuq belgisi / apostrophe variants
    .replace(/\s+(tumani|tuman|shahri|shahar)$/i, "") // strip trailing admin-unit words
    .replace(/[^a-z0-9]/g, ""); // strip remaining diacritics/punctuation/spaces
}

/**
 * Common Uzbek-Latin <-> casual-English transliteration swaps (q/k, x/h,
 * x/kh, o/a). Applied as a powerset so combinations (e.g. "Andijon" vs
 * "Andijan") are covered too. Small dataset, so brute force is fine.
 */
const SUBSTITUTIONS: Array<[string, string]> = [
  ["q", "k"],
  ["x", "h"],
  ["x", "kh"],
  ["o", "a"]
];

/**
 * A few well-known places use an English exonym or transliteration too
 * different from the Uzbek-Latin spelling for the q/k/x/h/o/a substitution
 * rules above to bridge (e.g. "Fergana" vs "Farg'ona", "Kokand" vs
 * "Qo'qon"). Keyed by the canonical district's own stem so it still
 * participates in the normal single/ambiguous-match logic below rather
 * than being force-picked.
 */
const MANUAL_ALIAS_STEMS: Record<string, string[]> = {
  fargona: ["fergana"],
  urganch: ["urgench"],
  navoiy: ["navoi"],
  qoqon: ["kokand"],
  kattaqorgon: ["kattakurgan"],
  tortkol: ["turtkul"],
  sirgali: ["sergeli"],
  bogdod: ["bagdod"],
  moynoq: ["moynaq"],
  shayxontohur: ["shaykhantohur"]
};

function stemVariants(value: string): Set<string> {
  const base = baseStem(value);
  const variants = new Set<string>([base]);

  for (const [from, to] of SUBSTITUTIONS) {
    for (const existing of [...variants]) {
      if (existing.includes(from)) {
        variants.add(existing.split(from).join(to));
      }
    }
  }

  for (const alias of MANUAL_ALIAS_STEMS[base] ?? []) {
    variants.add(alias);
  }

  return variants;
}

type MatchResult =
  | { kind: "already-canonical" }
  | { kind: "matched"; canonical: string; viaSubstitution: boolean; preferredCity?: boolean }
  | { kind: "ambiguous"; candidates: string[] }
  | { kind: "no-match" }
  | { kind: "unknown-region" };

/**
 * When a name is ambiguous between a city and its same-named surrounding
 * rural district (e.g. "Samarqand" vs "Samarqand tumani"), a listing typed
 * as "in Samarkand" almost always means the city. Resolve to the one
 * candidate that ISN'T an administrative-unit-suffixed name, if exactly one
 * qualifies; otherwise leave genuinely ambiguous.
 */
function preferCity(candidates: string[]): string | null {
  const bare = candidates.filter((name) => !/\s(tumani|tuman|shahri|shahar)$/i.test(name));
  return bare.length === 1 ? bare[0] : null;
}

function matchDistrict(region: string, district: string): MatchResult {
  if (!isUzbekistanRegion(region)) {
    return { kind: "unknown-region" };
  }

  const canonicalList = UZBEKISTAN_DISTRICTS[region];

  if (canonicalList.includes(district)) {
    return { kind: "already-canonical" };
  }

  const targetStem = baseStem(district);

  const exactCandidates = canonicalList.filter((canonical) => baseStem(canonical) === targetStem);
  if (exactCandidates.length === 1) {
    return { kind: "matched", canonical: exactCandidates[0], viaSubstitution: false };
  }
  if (exactCandidates.length > 1) {
    const city = preferCity(exactCandidates);
    if (city) {
      return { kind: "matched", canonical: city, viaSubstitution: false, preferredCity: true };
    }
    return { kind: "ambiguous", candidates: exactCandidates };
  }

  const fuzzyCandidates = canonicalList.filter((canonical) => stemVariants(canonical).has(targetStem));
  if (fuzzyCandidates.length === 1) {
    return { kind: "matched", canonical: fuzzyCandidates[0], viaSubstitution: true };
  }
  if (fuzzyCandidates.length > 1) {
    const city = preferCity(fuzzyCandidates);
    if (city) {
      return { kind: "matched", canonical: city, viaSubstitution: true, preferredCity: true };
    }
    return { kind: "ambiguous", candidates: fuzzyCandidates };
  }

  return { kind: "no-match" };
}

async function main() {
  const apply = process.argv.includes("--apply");

  const listings = await prisma.$queryRaw<{ id: string; region: string; district: string; title: string }[]>`
    SELECT "id", "region", "district", "title" FROM "Listing"
  `;

  const toUpdate: {
    id: string;
    title: string;
    region: string;
    from: string;
    to: string;
    fuzzy: boolean;
    preferredCity: boolean;
  }[] = [];
  const ambiguous: { id: string; title: string; region: string; district: string; candidates: string[] }[] = [];
  const noMatch: { id: string; title: string; region: string; district: string }[] = [];
  const unknownRegion: { id: string; title: string; region: string; district: string }[] = [];
  let alreadyCanonical = 0;

  for (const listing of listings) {
    const result = matchDistrict(listing.region, listing.district);

    switch (result.kind) {
      case "already-canonical":
        alreadyCanonical += 1;
        break;
      case "matched":
        toUpdate.push({
          id: listing.id,
          title: listing.title,
          region: listing.region,
          from: listing.district,
          to: result.canonical,
          fuzzy: result.viaSubstitution,
          preferredCity: Boolean(result.preferredCity)
        });
        break;
      case "ambiguous":
        ambiguous.push({
          id: listing.id,
          title: listing.title,
          region: listing.region,
          district: listing.district,
          candidates: result.candidates
        });
        break;
      case "no-match":
        noMatch.push({ id: listing.id, title: listing.title, region: listing.region, district: listing.district });
        break;
      case "unknown-region":
        unknownRegion.push({ id: listing.id, title: listing.title, region: listing.region, district: listing.district });
        break;
    }
  }

  console.log(`Total listings: ${listings.length}`);
  console.log(`Already canonical: ${alreadyCanonical}`);
  console.log(`Confident matches to normalize: ${toUpdate.length}`);
  console.log(`Ambiguous (needs manual pick): ${ambiguous.length}`);
  console.log(`No match found (needs manual review): ${noMatch.length}`);
  console.log(`Unknown region (skipped): ${unknownRegion.length}`);
  console.log("");

  if (toUpdate.length > 0) {
    console.log("--- Confident matches (exact stem) ---");
    for (const item of toUpdate.filter((i) => !i.fuzzy && !i.preferredCity)) {
      console.log(`[${item.region}] "${item.from}" -> "${item.to}"  (listing: ${item.title}, id=${item.id})`);
    }
    console.log("");
    console.log("--- Confident matches (via transliteration substitution, e.g. q/k, x/h, o/a) ---");
    for (const item of toUpdate.filter((i) => i.fuzzy && !i.preferredCity)) {
      console.log(`[${item.region}] "${item.from}" -> "${item.to}"  (listing: ${item.title}, id=${item.id})`);
    }
    console.log("");
    console.log("--- Resolved city vs same-named-district ambiguity by preferring the city ---");
    for (const item of toUpdate.filter((i) => i.preferredCity)) {
      console.log(`[${item.region}] "${item.from}" -> "${item.to}"  (listing: ${item.title}, id=${item.id})`);
    }
    console.log("");
  }

  if (ambiguous.length > 0) {
    console.log("--- AMBIGUOUS (not auto-applied, review manually) ---");
    for (const item of ambiguous) {
      console.log(
        `[${item.region}] "${item.district}" could be: ${item.candidates.join(" | ")}  (listing: ${item.title}, id=${item.id})`
      );
    }
    console.log("");
  }

  if (noMatch.length > 0) {
    console.log("--- NO MATCH (not auto-applied, review manually) ---");
    for (const item of noMatch) {
      console.log(`[${item.region}] "${item.district}"  (listing: ${item.title}, id=${item.id})`);
    }
    console.log("");
  }

  if (unknownRegion.length > 0) {
    console.log("--- UNKNOWN REGION (not auto-applied) ---");
    for (const item of unknownRegion) {
      console.log(`region="${item.region}" district="${item.district}"  (listing: ${item.title}, id=${item.id})`);
    }
    console.log("");
  }

  if (!apply) {
    console.log(`DRY RUN — no changes written. Re-run with --apply to write the ${toUpdate.length} confident matches.`);
    return;
  }

  console.log(`Applying ${toUpdate.length} updates...`);
  for (const item of toUpdate) {
    await prisma.$executeRaw`UPDATE "Listing" SET "district" = ${item.to}, "updatedAt" = NOW() WHERE "id" = ${item.id}`;
  }
  console.log("Done.");
}

main().finally(() => prisma.$disconnect());
