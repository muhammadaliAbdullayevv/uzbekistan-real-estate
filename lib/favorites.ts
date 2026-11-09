import { randomUUID } from "node:crypto";

import { cookies, headers } from "next/headers";
import type { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getApprovedListingsByIds } from "@/lib/listings";
import {
  VISITOR_ID_COOKIE,
  VISITOR_ID_HEADER,
  VISITOR_ID_TTL_SECONDS
} from "@/lib/visitor-id-constants";

export { VISITOR_ID_COOKIE };

// Anonymous-first: no login needed to save a listing. Each visitor gets a
// long-lived id, set by middleware.ts on every page view (forwarded here via
// a request header) so it's available immediately -- including before
// they've ever favorited anything. API routes aren't covered by that
// middleware, so they fall back to reading the cookie directly.
export function getVisitorId() {
  return headers().get(VISITOR_ID_HEADER) ?? cookies().get(VISITOR_ID_COOKIE)?.value ?? null;
}

export function setVisitorIdCookie(response: NextResponse, visitorId: string) {
  response.cookies.set({
    name: VISITOR_ID_COOKIE,
    value: visitorId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_ID_TTL_SECONDS
  });
}

type FavoriteRow = {
  listingId: string;
};

async function getFavoriteRows(visitorId: string | null, userId: string | null) {
  if (!visitorId && !userId) {
    return [];
  }

  const ownerConditions = [];
  if (visitorId) {
    ownerConditions.push(Prisma.sql`"visitorId" = ${visitorId}`);
  }
  if (userId) {
    ownerConditions.push(Prisma.sql`"userId" = ${userId}`);
  }

  return prisma.$queryRaw<FavoriteRow[]>(
    Prisma.sql`
      SELECT "listingId", MAX("createdAt") AS "createdAt"
      FROM "FavoriteListing"
      WHERE ${Prisma.join(ownerConditions, " OR ")}
      GROUP BY "listingId"
      ORDER BY MAX("createdAt") DESC
    `
  );
}

export async function getFavoriteListingIds(visitorId: string | null, userId: string | null) {
  const rows = await getFavoriteRows(visitorId, userId);

  return new Set(rows.map((row) => row.listingId));
}

export async function getFavoriteListings(visitorId: string | null, userId: string | null) {
  const rows = await getFavoriteRows(visitorId, userId);

  return getApprovedListingsByIds(rows.map((row) => row.listingId));
}

export async function addFavorite(input: {
  visitorId: string;
  userId: string | null;
  listingId: string;
}) {
  const listing = await prisma.listing.findFirst({
    where: {
      id: input.listingId,
      status: "APPROVED"
    },
    select: { id: true }
  });

  if (!listing) {
    return false;
  }

  await prisma.$executeRaw`
    INSERT INTO "FavoriteListing" ("id", "visitorId", "userId", "listingId", "createdAt")
    VALUES (${randomUUID()}, ${input.visitorId}, ${input.userId}, ${listing.id}, ${new Date()})
    ON CONFLICT ("visitorId", "listingId") DO NOTHING
  `;

  if (!input.userId) {
    return true;
  }

  // Claim the anonymous row for this account -- unless the account already
  // favorited the same listing from a different browser/device, in which
  // case keep that one and drop this now-redundant row instead of violating
  // the (userId, listingId) uniqueness.
  const duplicate = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "FavoriteListing"
    WHERE "userId" = ${input.userId} AND "listingId" = ${listing.id} AND "visitorId" != ${input.visitorId}
    LIMIT 1
  `;

  if (duplicate[0]) {
    await prisma.$executeRaw`
      DELETE FROM "FavoriteListing"
      WHERE "visitorId" = ${input.visitorId} AND "listingId" = ${listing.id} AND "userId" IS NULL
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "FavoriteListing" SET "userId" = ${input.userId}
      WHERE "visitorId" = ${input.visitorId} AND "listingId" = ${listing.id} AND "userId" IS NULL
    `;
  }

  return true;
}

export async function removeFavorite(input: {
  visitorId: string | null;
  userId: string | null;
  listingId: string;
}) {
  const ownerConditions = [];
  if (input.visitorId) {
    ownerConditions.push(Prisma.sql`"visitorId" = ${input.visitorId}`);
  }
  if (input.userId) {
    ownerConditions.push(Prisma.sql`"userId" = ${input.userId}`);
  }

  if (ownerConditions.length === 0) {
    return;
  }

  await prisma.$executeRaw(
    Prisma.sql`
      DELETE FROM "FavoriteListing"
      WHERE "listingId" = ${input.listingId} AND (${Prisma.join(ownerConditions, " OR ")})
    `
  );
}

export async function clearAllFavorites(input: {
  visitorId: string | null;
  userId: string | null;
}) {
  const ownerConditions = [];
  if (input.visitorId) {
    ownerConditions.push(Prisma.sql`"visitorId" = ${input.visitorId}`);
  }
  if (input.userId) {
    ownerConditions.push(Prisma.sql`"userId" = ${input.userId}`);
  }

  if (ownerConditions.length === 0) {
    return;
  }

  await prisma.$executeRaw(
    Prisma.sql`
      DELETE FROM "FavoriteListing"
      WHERE ${Prisma.join(ownerConditions, " OR ")}
    `
  );
}

/**
 * Called right after a visitor logs in (password login, register, Google
 * OAuth) so whatever they saved anonymously in this browser follows their
 * account from now on, instead of being stranded on the old cookie.
 */
export async function mergeFavoritesIntoUser(visitorId: string | null, userId: string) {
  if (!visitorId) {
    return;
  }

  const anonRows = await prisma.$queryRaw<{ id: string; listingId: string }[]>`
    SELECT "id", "listingId" FROM "FavoriteListing"
    WHERE "visitorId" = ${visitorId} AND "userId" IS NULL
  `;

  for (const row of anonRows) {
    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "FavoriteListing"
      WHERE "userId" = ${userId} AND "listingId" = ${row.listingId}
      LIMIT 1
    `;

    if (existing[0]) {
      await prisma.$executeRaw`DELETE FROM "FavoriteListing" WHERE "id" = ${row.id}`;
    } else {
      await prisma.$executeRaw`UPDATE "FavoriteListing" SET "userId" = ${userId} WHERE "id" = ${row.id}`;
    }
  }
}
