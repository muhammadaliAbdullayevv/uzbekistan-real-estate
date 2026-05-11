import { randomUUID } from "node:crypto";

import { Prisma, type PropertyType, type RentType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deleteStoredUserSessionsByUserId } from "@/lib/session-store";
import type { UserPreferenceInput } from "@/lib/validations/listing";

/** Stored role is legacy; authorization uses OWNER_EMAIL only. Never expose ADMIN as a public capability. */
export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

/** Safe user profile — never includes passwordHash (not selected from DB). */
export type UserProfile = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  telegramUsername: string | null;
  preferredRegion: string | null;
  preferredDistrict: string | null;
  preferredPropertyType: PropertyType | null;
  preferredRentType: RentType | null;
  preferredMinPrice: number | null;
  preferredMaxPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserRow = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  telegramUsername: string | null;
  preferredRegion: string | null;
  preferredDistrict: string | null;
  preferredPropertyType: PropertyType | null;
  preferredRentType: RentType | null;
  preferredMinPrice: number | null;
  preferredMaxPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserAuthRow = UserRow & {
  passwordHash: string | null;
};

function normalizeUser(row: UserRow): UserProfile {
  return {
    ...row,
    preferredMinPrice:
      row.preferredMinPrice === null ? null : Number(row.preferredMinPrice),
    preferredMaxPrice:
      row.preferredMaxPrice === null ? null : Number(row.preferredMaxPrice)
  };
}

function normalizeAuthRow(row: UserAuthRow): UserAuthRecord {
  return {
    ...normalizeUser(row),
    passwordHash: row.passwordHash
  };
}

/** Internal: login/register only — includes passwordHash. */
export type UserAuthRecord = UserProfile & {
  passwordHash: string | null;
};

export async function getUserByEmail(email: string): Promise<UserAuthRecord | null> {
  const rows = await prisma.$queryRaw<UserAuthRow[]>`
    SELECT
      "id",
      "email",
      "emailVerifiedAt",
      "name",
      "role",
      "status",
      "passwordHash",
      "phone",
      "telegramUsername",
      "preferredRegion",
      "preferredDistrict",
      "preferredPropertyType",
      "preferredRentType",
      "preferredMinPrice",
      "preferredMaxPrice",
      "createdAt",
      "updatedAt"
    FROM "User"
    WHERE "email" = ${email}
    LIMIT 1
  `;

  return rows[0] ? normalizeAuthRow(rows[0]) : null;
}

const publicUserColumns = Prisma.sql`
  "id",
  "email",
  "emailVerifiedAt",
  "name",
  "role",
  "status",
  "phone",
  "telegramUsername",
  "preferredRegion",
  "preferredDistrict",
  "preferredPropertyType",
  "preferredRentType",
  "preferredMinPrice",
  "preferredMaxPrice",
  "createdAt",
  "updatedAt"
`;

export async function getUserProfileById(userId: string) {
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT ${publicUserColumns}
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `;

  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function createUserProfile(input: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
}) {
  const id = randomUUID();
  const now = new Date();
  const phone = input.phone?.trim() || null;

  await prisma.$executeRaw`
    INSERT INTO "User" (
      "id",
      "email",
      "name",
      "passwordHash",
      "phone",
      "emailVerifiedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.email},
      ${input.name},
      ${input.passwordHash},
      ${phone},
      ${now},
      ${now},
      ${now}
    )
  `;

  return {
    id,
    email: input.email,
    emailVerifiedAt: now,
    name: input.name,
    role: "USER" as UserRole
  };
}

export async function searchUsersByEmail(query: string) {
  const term = query.trim();

  if (!term) {
    return [];
  }

  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT ${publicUserColumns}
    FROM "User"
    WHERE "email" ILIKE ${`%${term}%`}
    ORDER BY
      CASE WHEN LOWER("email") = LOWER(${term}) THEN 0 ELSE 1 END,
      "createdAt" DESC
    LIMIT 20
  `;

  return rows.map(normalizeUser);
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET "passwordHash" = ${passwordHash}, "updatedAt" = ${now}
    WHERE "id" = ${userId}
  `;

  return getUserProfileById(userId);
}

export async function applyUserAdminAction(userId: string, action: "BLOCK" | "UNBLOCK") {
  const now = new Date();

  switch (action) {
    case "BLOCK":
      await prisma.$executeRaw`
        UPDATE "User"
        SET "status" = CAST(${"BLOCKED"} AS "UserStatus"), "updatedAt" = ${now}
        WHERE "id" = ${userId}
      `;
      await deleteStoredUserSessionsByUserId(userId);
      break;
    case "UNBLOCK":
      await prisma.$executeRaw`
        UPDATE "User"
        SET "status" = CAST(${"ACTIVE"} AS "UserStatus"), "updatedAt" = ${now}
        WHERE "id" = ${userId}
      `;
      break;
    default:
      break;
  }

  return getUserProfileById(userId);
}

export async function updateUserPreferences(userId: string, input: UserPreferenceInput) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "name" = ${input.name},
      "phone" = ${input.phone},
      "telegramUsername" = ${input.telegramUsername},
      "preferredRegion" = ${input.preferredRegion},
      "preferredDistrict" = ${input.preferredDistrict},
      "preferredPropertyType" = CAST(${input.preferredPropertyType} AS "PropertyType"),
      "preferredRentType" = CAST(${input.preferredRentType} AS "RentType"),
      "preferredMinPrice" = ${input.preferredMinPrice},
      "preferredMaxPrice" = ${input.preferredMaxPrice},
      "updatedAt" = ${now}
    WHERE "id" = ${userId}
  `;

  return getUserProfileById(userId);
}
