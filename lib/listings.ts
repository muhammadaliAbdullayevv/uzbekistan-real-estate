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
  nearLat?: string;
  nearLng?: string;
  limit?: number;
  offset?: number;
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
  latitude: number | null;
  longitude: number | null;
  locationPrecision: "EXACT" | "APPROXIMATE";
  availabilityStatus: ListingAvailabilityStatusValue;
  phone: string;
  telegramUsername: string | null;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  images: ListingImageRecord[];
  distanceKm?: number;
};

type ListingRow = Omit<ListingWithImages, "images"> & {
  images: unknown;
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

type NearPoint = { lat: number; lng: number };

function buildSelectSql(near?: NearPoint) {
  // Haversine great-circle distance in km. The LEAST/GREATEST clamp guards
  // against floating-point rounding pushing acos()'s argument fractionally
  // outside [-1, 1], which would otherwise produce NaN for near-antipodal
  // or identical points.
  const distanceColumn = near
    ? Prisma.sql`,
      6371 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians(${near.lat})) * cos(radians(l."latitude")) * cos(radians(l."longitude") - radians(${near.lng}))
          + sin(radians(${near.lat})) * sin(radians(l."latitude"))
        ))
      ) AS "distanceKm"`
    : Prisma.sql``;

  return Prisma.sql`
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
      l."latitude",
      l."longitude",
      l."locationPrecision",
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
      ${distanceColumn}
    FROM "Listing" l
    LEFT JOIN "ListingImage" li ON li."listingId" = l."id"
  `;
}

function mapListingRow(row: ListingRow): ListingWithImages {
  const rawImages = Array.isArray(row.images)
    ? row.images
    : typeof row.images === "string"
      ? JSON.parse(row.images)
      : [];

  return {
    ...row,
    images: (rawImages as ListingImageRecord[]) ?? [],
    distanceKm:
      row.distanceKm === undefined || row.distanceKm === null
        ? undefined
        : Number(row.distanceKm)
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

function parseNearPoint(filters: ListingSearchParams): NearPoint | undefined {
  const latRaw = getFirstParam(filters.nearLat)?.trim();
  const lngRaw = getFirstParam(filters.nearLng)?.trim();

  // Number("") is 0, not NaN -- without this check, the hidden nearLat/
  // nearLng inputs (empty when "near me" isn't active) would silently
  // activate near-mode sorted from (0, 0) on every normal filter submit.
  if (!latRaw || !lngRaw) {
    return undefined;
  }

  const lat = Number(latRaw);
  const lng = Number(lngRaw);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return undefined;
  }

  return { lat, lng };
}

function buildWhereSql(filters: ListingSearchParams, near?: NearPoint) {
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

  if (near) {
    conditions.push(Prisma.sql`l."latitude" IS NOT NULL AND l."longitude" IS NOT NULL`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
}

function buildOrderBySql(sort?: string, near?: NearPoint) {
  if (near) {
    return Prisma.sql`ORDER BY "distanceKm" ASC, l."createdAt" DESC`;
  }

  const value = getFirstParam(sort);

  if (value === "price_asc") {
    return Prisma.sql`ORDER BY l."price" ASC, l."createdAt" DESC`;
  }

  if (value === "price_desc") {
    return Prisma.sql`ORDER BY l."price" DESC, l."createdAt" DESC`;
  }

  return Prisma.sql`ORDER BY l."createdAt" DESC`;
}

async function runListingQuery(
  whereSql: Prisma.Sql,
  orderBySql: Prisma.Sql,
  near?: NearPoint,
  limitSql: Prisma.Sql = Prisma.sql``
) {
  const rows = await prisma.$queryRaw<ListingRow[]>(
    Prisma.sql`${buildSelectSql(near)} ${whereSql} ${groupAndOrderSql(orderBySql)} ${limitSql}`
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
      ${buildSelectSql()}
      WHERE l."status" = ${listingStatusSql(ListingStatus.APPROVED)}
        AND l."availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus")
        AND l."id" IN (${Prisma.join(ids)})
      ${groupAndOrderSql(Prisma.sql`ORDER BY l."createdAt" DESC`)}
    `
  );

  return orderListingsByIds(rows.map(mapListingRow), ids);
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
  const near = parseNearPoint(filters);
  const limitSql =
    filters.limit !== undefined
      ? Prisma.sql`LIMIT ${filters.limit} OFFSET ${filters.offset ?? 0}`
      : Prisma.sql``;

  return runListingQuery(
    buildWhereSql(filters, near),
    buildOrderBySql(filters.sort, near),
    near,
    limitSql
  );
}

export async function countApprovedListings(filters: ListingSearchParams) {
  const near = parseNearPoint(filters);
  const rows = await prisma.$queryRaw<{ count: bigint }[]>(
    Prisma.sql`SELECT COUNT(*) AS count FROM "Listing" l ${buildWhereSql(filters, near)}`
  );

  return Number(rows[0]?.count ?? 0);
}

export async function getApprovedListingById(id: string) {
  const rows = await runListingQuery(
    Prisma.sql`WHERE l."status" = ${listingStatusSql(ListingStatus.APPROVED)} AND l."availabilityStatus" = CAST(${LISTING_AVAILABILITY_STATUS.ACTIVE} AS "ListingAvailabilityStatus") AND l."id" = ${id}`,
    Prisma.sql`ORDER BY l."createdAt" DESC`
  );

  return rows[0] ?? null;
}

export async function getPendingListings(options?: { limit?: number; offset?: number }) {
  const limitSql =
    options?.limit !== undefined
      ? Prisma.sql`LIMIT ${options.limit} OFFSET ${options.offset ?? 0}`
      : Prisma.sql``;

  const rows = await prisma.$queryRaw<ListingRow[]>(
    Prisma.sql`
      ${buildSelectSql()}
      WHERE l."status" = ${listingStatusSql(ListingStatus.PENDING)}
      ${groupAndOrderSql(Prisma.sql`ORDER BY l."createdAt" ASC`)}
      ${limitSql}
    `
  );

  return rows.map(mapListingRow);
}

export async function countPendingListings() {
  return prisma.listing.count({ where: { status: ListingStatus.PENDING } });
}

export async function countActiveListings() {
  return prisma.listing.count({
    where: {
      status: ListingStatus.APPROVED,
      availabilityStatus: LISTING_AVAILABILITY_STATUS.ACTIVE
    }
  });
}

/**
 * Owner-only: fetches a listing by id regardless of status (pending,
 * approved, or rejected). Never use this for a public-facing route -- see
 * getApprovedListingById for the public equivalent that enforces the
 * approved+active filter.
 */
export async function getListingByIdForOwner(id: string) {
  const rows = await runListingQuery(
    Prisma.sql`WHERE l."id" = ${id}`,
    Prisma.sql`ORDER BY l."createdAt" DESC`
  );

  return rows[0] ?? null;
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
    latitude: number;
    longitude: number;
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
          "latitude" = ${input.latitude},
          "longitude" = ${input.longitude},
          "locationPrecision" = CAST('EXACT' AS "LocationPrecision"),
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

