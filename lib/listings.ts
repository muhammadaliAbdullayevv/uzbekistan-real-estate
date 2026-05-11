import { randomUUID } from "node:crypto";

import {
  Currency,
  ListingStatus,
  Prisma,
  PropertyType
} from "@prisma/client";

import {
  LISTING_TYPES,
  type ListingTypeValue,
  type RentTypeValue
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import { isUzbekistanRegion } from "@/lib/locations";
import { getUserProfileById } from "@/lib/user-data";

export type ListingSearchParams = {
  q?: string;
  listingType?: string;
  region?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  rooms?: string;
  propertyType?: string;
  currency?: string;
  sort?: string;
};

export type ListingImageRecord = {
  id: string;
  url: string;
  listingId: string;
};

export type ListingWithImages = {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: ListingTypeValue;
  currency: Currency;
  region: string;
  district: string;
  city: string | null;
  address: string;
  rooms: number;
  area: number;
  propertyType: PropertyType;
  rentType: RentTypeValue | null;
  availabilityStatus: ListingAvailabilityStatusValue;
  phone: string;
  telegramUsername: string | null;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  images: ListingImageRecord[];
};

type ListingRow = Omit<ListingWithImages, "images"> & {
  images: unknown;
};

type FavoriteRow = {
  listingId: string;
  createdAt: Date;
};

type ViewRow = {
  listingId: string;
  lastViewedAt: Date;
};

export type ListingAvailabilityStatusValue = "ACTIVE" | "RENTED" | "SOLD";

const LISTING_AVAILABILITY_STATUS = {
  ACTIVE: "ACTIVE",
  RENTED: "RENTED",
  SOLD: "SOLD"
} as const;

const listingSelectSql = Prisma.sql`
  SELECT
    l."id",
    l."title",
    l."description",
    l."price",
    l."listingType",
    l."currency",
    l."region",
    l."district",
    l."city",
    l."address",
    l."rooms",
    l."area",
    l."propertyType",
    l."rentType",
    l."availabilityStatus",
    l."phone",
    l."telegramUsername",
    l."status",
    l."createdAt",
    l."updatedAt",
    l."userId",
    COALESCE(
      json_agg(
        json_build_object(
          'id', li."id",
          'url', li."url",
          'listingId', li."listingId"
        )
        ORDER BY li."id"
      ) FILTER (WHERE li."id" IS NOT NULL),
      '[]'::json
    ) AS "images"
  FROM "Listing" l
  LEFT JOIN "ListingImage" li ON li."listingId" = l."id"
`;

function mapListingRow(row: ListingRow): ListingWithImages {
  const rawImages = Array.isArray(row.images)
    ? row.images
    : typeof row.images === "string"
      ? JSON.parse(row.images)
      : [];

  return {
    ...row,
    images: (rawImages as ListingImageRecord[]) ?? []
  };
}

function groupAndOrderSql(orderBySql: Prisma.Sql) {
  return Prisma.sql`
    GROUP BY l."id"
    ${orderBySql}
  `;
}

function listingStatusSql(status: ListingStatus) {
  return Prisma.sql`CAST(${status} AS "ListingStatus")`;
}

function buildWhereSql(filters: ListingSearchParams) {
  const q = getFirstParam(filters.q)?.trim();
  const region = getFirstParam(filters.region)?.trim();
  const district = getFirstParam(filters.district)?.trim();
  const listingType = getFirstParam(filters.listingType)?.trim() as ListingTypeValue | undefined;
  const rooms = toPositiveNumber(getFirstParam(filters.rooms));
  const minPrice = toPositiveNumber(getFirstParam(filters.minPrice));
  const maxPrice = toPositiveNumber(getFirstParam(filters.maxPrice));
  const propertyType = getFirstParam(filters.propertyType)?.trim() as
    | PropertyType
    | undefined;
  const currency = getFirstParam(filters.currency)?.trim() as Currency | undefined;
  const conditions: Prisma.Sql[] = [
    Prisma.sql`l."status" = ${listingStatusSql(ListingStatus.APPROVED)}`,
    Prisma.sql`l."availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus")`
  ];

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      Prisma.sql`(
        l."title" ILIKE ${pattern}
        OR l."description" ILIKE ${pattern}
        OR l."region" ILIKE ${pattern}
        OR l."district" ILIKE ${pattern}
        OR COALESCE(l."city", '') ILIKE ${pattern}
        OR l."address" ILIKE ${pattern}
      )`
    );
  }

  if (region && isUzbekistanRegion(region)) {
    conditions.push(Prisma.sql`l."region" = ${region}`);
  }

  if (listingType && LISTING_TYPES.includes(listingType)) {
    conditions.push(Prisma.sql`l."listingType" = ${listingType}`);
  }

  if (district) {
    const pattern = `%${district}%`;
    conditions.push(
      Prisma.sql`(
        l."district" ILIKE ${pattern}
        OR COALESCE(l."city", '') ILIKE ${pattern}
        OR l."address" ILIKE ${pattern}
      )`
    );
  }

  if (rooms) {
    conditions.push(Prisma.sql`l."rooms" = ${rooms}`);
  }

  if (propertyType && ["flat", "house", "room"].includes(propertyType)) {
    conditions.push(Prisma.sql`l."propertyType" = CAST(${propertyType} AS "PropertyType")`);
  }

  if (currency && ["USD", "UZS"].includes(currency)) {
    conditions.push(Prisma.sql`l."currency" = CAST(${currency} AS "Currency")`);
  }

  if (minPrice) {
    conditions.push(Prisma.sql`l."price" >= ${minPrice}`);
  }

  if (maxPrice) {
    conditions.push(Prisma.sql`l."price" <= ${maxPrice}`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
}

function buildOrderBySql(sort?: string) {
  const value = getFirstParam(sort);

  if (value === "price_asc") {
    return Prisma.sql`ORDER BY l."price" ASC, l."createdAt" DESC`;
  }

  if (value === "price_desc") {
    return Prisma.sql`ORDER BY l."price" DESC, l."createdAt" DESC`;
  }

  return Prisma.sql`ORDER BY l."createdAt" DESC`;
}

async function runListingQuery(whereSql: Prisma.Sql, orderBySql: Prisma.Sql) {
  const rows = await prisma.$queryRaw<ListingRow[]>(
    Prisma.sql`${listingSelectSql} ${whereSql} ${groupAndOrderSql(orderBySql)}`
  );

  return rows.map(mapListingRow);
}

function orderListingsByIds(listings: ListingWithImages[], ids: string[]) {
  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  return ids
    .map((id) => listingMap.get(id))
    .filter((listing): listing is ListingWithImages => Boolean(listing));
}

async function getApprovedListingsByIds(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const rows = await prisma.$queryRaw<ListingRow[]>(
    Prisma.sql`
      ${listingSelectSql}
      WHERE l."status" = ${listingStatusSql(ListingStatus.APPROVED)}
        AND l."availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus")
        AND l."id" IN (${Prisma.join(ids)})
      ${groupAndOrderSql(Prisma.sql`ORDER BY l."createdAt" DESC`)}
    `
  );

  return orderListingsByIds(rows.map(mapListingRow), ids);
}

async function getFavoriteRows(userId: string, limit?: number) {
  if (limit) {
    return prisma.$queryRaw<FavoriteRow[]>`
      SELECT "listingId", "createdAt"
      FROM "FavoriteListing"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
  }

  return prisma.$queryRaw<FavoriteRow[]>`
    SELECT "listingId", "createdAt"
    FROM "FavoriteListing"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
  `;
}

async function getViewRows(userId: string, limit?: number) {
  if (limit) {
    return prisma.$queryRaw<ViewRow[]>`
      SELECT "listingId", MAX("viewedAt") AS "lastViewedAt"
      FROM "ListingView"
      WHERE "userId" = ${userId}
      GROUP BY "listingId"
      ORDER BY MAX("viewedAt") DESC
      LIMIT ${limit}
    `;
  }

  return prisma.$queryRaw<ViewRow[]>`
    SELECT "listingId", MAX("viewedAt") AS "lastViewedAt"
    FROM "ListingView"
    WHERE "userId" = ${userId}
    GROUP BY "listingId"
    ORDER BY MAX("viewedAt") DESC
  `;
}

export function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toPositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export async function getApprovedListings(filters: ListingSearchParams) {
  return runListingQuery(buildWhereSql(filters), buildOrderBySql(filters.sort));
}

export async function getApprovedListingById(id: string) {
  const rows = await runListingQuery(
    Prisma.sql`WHERE l."status" = ${listingStatusSql(ListingStatus.APPROVED)} AND l."availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus") AND l."id" = ${id}`,
    Prisma.sql`ORDER BY l."createdAt" DESC`
  );

  return rows[0] ?? null;
}

export async function getPendingListings() {
  return runListingQuery(
    Prisma.sql`WHERE l."status" = ${listingStatusSql(ListingStatus.PENDING)}`,
    Prisma.sql`ORDER BY l."createdAt" DESC`
  );
}

export async function getListingsForUser(userId: string) {
  return runListingQuery(
    Prisma.sql`WHERE l."userId" = ${userId}`,
    Prisma.sql`ORDER BY l."createdAt" DESC`
  );
}

export async function getListingForUserById(userId: string, listingId: string) {
  const rows = await runListingQuery(
    Prisma.sql`WHERE l."userId" = ${userId} AND l."id" = ${listingId}`,
    Prisma.sql`ORDER BY l."createdAt" DESC`
  );

  return rows[0] ?? null;
}

export async function getFavoriteListingIds(userId: string) {
  const favorites = await getFavoriteRows(userId);

  return new Set(favorites.map((favorite) => favorite.listingId));
}

export async function isListingFavorited(userId: string, listingId: string) {
  const rows = await prisma.$queryRaw<Array<{ exists: number }>>`
    SELECT 1 AS "exists"
    FROM "FavoriteListing"
    WHERE "userId" = ${userId} AND "listingId" = ${listingId}
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function addFavoriteListing(userId: string, listingId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "Listing"
    WHERE
      "id" = ${listingId}
      AND "status" = CAST(${ListingStatus.APPROVED} AS "ListingStatus")
      AND "availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus")
    LIMIT 1
  `;

  if (rows.length === 0) {
    return false;
  }

  await prisma.$executeRaw`
    INSERT INTO "FavoriteListing" ("id", "userId", "listingId", "createdAt")
    VALUES (${randomUUID()}, ${userId}, ${listingId}, ${new Date()})
    ON CONFLICT ("userId", "listingId") DO NOTHING
  `;

  return true;
}

export async function removeFavoriteListing(userId: string, listingId: string) {
  await prisma.$executeRaw`
    DELETE FROM "FavoriteListing"
    WHERE "userId" = ${userId} AND "listingId" = ${listingId}
  `;
}

export async function getFavoriteListingsForUser(userId: string) {
  const favorites = await getFavoriteRows(userId);

  return getApprovedListingsByIds(favorites.map((favorite) => favorite.listingId));
}

export async function getRecentViewedListingsForUser(userId: string, limit = 6) {
  const views = await getViewRows(userId, limit);

  return getApprovedListingsByIds(views.map((view) => view.listingId));
}

export async function trackListingView(userId: string, listingId: string) {
  await prisma.$executeRaw`
    INSERT INTO "ListingView" ("id", "userId", "listingId", "viewedAt")
    VALUES (${randomUUID()}, ${userId}, ${listingId}, ${new Date()})
  `;
}

export async function updateListingForUser(
  userId: string,
  listingId: string,
  input: {
    listingType: ListingTypeValue;
    title: string;
    description: string;
    price: number;
    currency: Currency;
    region: string;
    district: string;
    city: string | null;
    address: string;
    rooms: number;
    area: number;
    propertyType: PropertyType;
    rentType: RentTypeValue | null;
    phone: string;
    images: string[];
  }
) {
  const existing = await getListingForUserById(userId, listingId);

  if (!existing) {
    return null;
  }

  const now = new Date();
  const normalizedAvailabilityStatus =
    existing.availabilityStatus === LISTING_AVAILABILITY_STATUS.ACTIVE
      ? LISTING_AVAILABILITY_STATUS.ACTIVE
      : input.listingType === "rent" &&
          existing.availabilityStatus === LISTING_AVAILABILITY_STATUS.RENTED
        ? LISTING_AVAILABILITY_STATUS.RENTED
        : input.listingType === "sale" &&
            existing.availabilityStatus === LISTING_AVAILABILITY_STATUS.SOLD
          ? LISTING_AVAILABILITY_STATUS.SOLD
          : LISTING_AVAILABILITY_STATUS.ACTIVE;

  await prisma.$transaction(async (tx) => {
    const rentTypeSql = input.rentType
      ? Prisma.sql`CAST(${input.rentType} AS "RentType")`
      : Prisma.sql`NULL`;

    await tx.$executeRaw(
      Prisma.sql`
        UPDATE "Listing"
        SET
          "listingType" = ${input.listingType},
          "title" = ${input.title},
          "description" = ${input.description},
          "price" = ${input.price},
          "currency" = CAST(${input.currency} AS "Currency"),
          "region" = ${input.region},
          "district" = ${input.district},
          "city" = ${input.city},
          "address" = ${input.address},
          "rooms" = ${input.rooms},
          "area" = ${input.area},
          "propertyType" = CAST(${input.propertyType} AS "PropertyType"),
          "rentType" = ${rentTypeSql},
          "availabilityStatus" = CAST(${normalizedAvailabilityStatus} AS "ListingAvailabilityStatus"),
          "phone" = ${input.phone},
          "updatedAt" = ${now}
        WHERE "id" = ${listingId} AND "userId" = ${userId}
      `
    );

    await tx.$executeRaw`
      DELETE FROM "ListingImage"
      WHERE "listingId" = ${listingId}
    `;

    for (const url of input.images) {
      await tx.$executeRaw`
        INSERT INTO "ListingImage" ("id", "url", "listingId")
        VALUES (${randomUUID()}, ${url}, ${listingId})
      `;
    }
  });

  return getListingForUserById(userId, listingId);
}

export async function updateListingAvailabilityForUser(
  userId: string,
  listingId: string,
  availabilityStatus: ListingAvailabilityStatusValue
) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "Listing"
    SET "availabilityStatus" = CAST(${availabilityStatus} AS "ListingAvailabilityStatus"), "updatedAt" = ${now}
    WHERE "id" = ${listingId} AND "userId" = ${userId}
  `;

  return getListingForUserById(userId, listingId);
}

export async function deleteListingForUser(userId: string, listingId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    DELETE FROM "Listing"
    WHERE "id" = ${listingId} AND "userId" = ${userId}
    RETURNING "id"
  `;

  return rows.length > 0;
}

function incrementCounter(map: Map<string, number>, key: string | null | undefined, amount: number) {
  if (!key) {
    return;
  }

  map.set(key, (map.get(key) ?? 0) + amount);
}

function getRangeBonus(price: number, minPrice?: number | null, maxPrice?: number | null) {
  if (!minPrice && !maxPrice) {
    return 0;
  }

  if (minPrice && price < minPrice) {
    return Math.max(-3, -((minPrice - price) / Math.max(minPrice, 1)) * 4);
  }

  if (maxPrice && price > maxPrice) {
    return Math.max(-3, -((price - maxPrice) / Math.max(maxPrice, 1)) * 4);
  }

  return 3;
}

function scoreListing(
  listing: ListingWithImages,
  user: {
    preferredRegion: string | null;
    preferredDistrict: string | null;
    preferredPropertyType: PropertyType | null;
    preferredRentType: string | null;
    preferredMinPrice: number | null;
    preferredMaxPrice: number | null;
  },
  counters: {
    region: Map<string, number>;
    district: Map<string, number>;
    propertyType: Map<string, number>;
    rentType: Map<string, number>;
  }
) {
  let score = 0;

  if (user.preferredRegion && listing.region === user.preferredRegion) {
    score += 4;
  }

  if (user.preferredDistrict && listing.district === user.preferredDistrict) {
    score += 5;
  }

  if (user.preferredPropertyType && listing.propertyType === user.preferredPropertyType) {
    score += 4;
  }

  if (user.preferredRentType && listing.rentType === user.preferredRentType) {
    score += 3;
  }

  score += getRangeBonus(listing.price, user.preferredMinPrice, user.preferredMaxPrice);
  score += counters.region.get(listing.region) ?? 0;
  score += counters.district.get(listing.district) ?? 0;
  score += counters.propertyType.get(listing.propertyType) ?? 0;

  if (listing.rentType) {
    score += counters.rentType.get(listing.rentType) ?? 0;
  }

  const ageInDays =
    (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 2 - ageInDays * 0.1);

  return score;
}

export async function getPersonalizedListings(userId: string, limit = 4) {
  const [user, favoriteRows, viewRows, listings] = await Promise.all([
    getUserProfileById(userId),
    getFavoriteRows(userId, 24),
    getViewRows(userId, 40),
    runListingQuery(
      Prisma.sql`WHERE l."status" = ${listingStatusSql(ListingStatus.APPROVED)} AND l."availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus")`,
      Prisma.sql`ORDER BY l."createdAt" DESC`
    )
  ]);

  if (!user) {
    return [];
  }

  const favoriteListings = await getApprovedListingsByIds(
    favoriteRows.map((favorite) => favorite.listingId)
  );
  const viewedListings = await getApprovedListingsByIds(viewRows.map((view) => view.listingId));
  const favoriteIds = new Set(favoriteListings.map((favorite) => favorite.id));
  const counters = {
    region: new Map<string, number>(),
    district: new Map<string, number>(),
    propertyType: new Map<string, number>(),
    rentType: new Map<string, number>()
  };

  for (const favorite of favoriteListings) {
    incrementCounter(counters.region, favorite.region, 1.8);
    incrementCounter(counters.district, favorite.district, 2.4);
    incrementCounter(counters.propertyType, favorite.propertyType, 2);
    incrementCounter(counters.rentType, favorite.rentType, 1.5);
  }

  for (const view of viewedListings) {
    incrementCounter(counters.region, view.region, 0.5);
    incrementCounter(counters.district, view.district, 0.8);
    incrementCounter(counters.propertyType, view.propertyType, 0.6);
    incrementCounter(counters.rentType, view.rentType, 0.4);
  }

  const scored = listings
    .filter((listing) => !favoriteIds.has(listing.id))
    .map((listing) => ({
      listing,
      score: scoreListing(listing, user, counters)
    }))
    .sort((a, b) => b.score - a.score);

  const recommendations = scored.filter((item) => item.score > 0).slice(0, limit);

  if (recommendations.length > 0) {
    return recommendations.map((item) => item.listing);
  }

  return [...listings]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}
