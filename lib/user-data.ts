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
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  plainPass?: string | null;
  telegramUsername: string | null;
  telegramChatId: string | null;
  phoneVerifiedAt: Date | null;
  preferredRegion: string | null;
  preferredDistrict: string | null;
  preferredPropertyType: PropertyType | null;
  preferredRentType: RentType | null;
  preferredMinPrice: number | null;
  preferredMaxPrice: number | null;
  preferencesPromptDismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserRow = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  plainPass: string | null;
  telegramUsername: string | null;
  telegramChatId: string | null;
  phoneVerifiedAt: Date | null;
  preferredRegion: string | null;
  preferredDistrict: string | null;
  preferredPropertyType: PropertyType | null;
  preferredRentType: RentType | null;
  preferredMinPrice: number | null;
  preferredMaxPrice: number | null;
  preferencesPromptDismissedAt: Date | null;
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
      "avatarUrl",
      "role",
      "status",
      "passwordHash",
      "plainPass",
      "phone",
      "telegramUsername",
      "telegramChatId",
      "phoneVerifiedAt",
      "preferredRegion",
      "preferredDistrict",
      "preferredPropertyType",
      "preferredRentType",
      "preferredMinPrice",
      "preferredMaxPrice",
      "preferencesPromptDismissedAt",
      "createdAt",
      "updatedAt"
    FROM "User"
    WHERE LOWER("email") = LOWER(${email})
    LIMIT 1
  `;

  return rows[0] ? normalizeAuthRow(rows[0]) : null;
}

/**
 * Looks up a user for login by Phone Number (+998901234567 / 901234567),
 * Telegram Username (@username), or Email.
 */
export async function getUserByLoginIdentifier(identifier: string): Promise<UserAuthRecord | null> {
  const raw = identifier.trim();
  if (!raw) {
    return null;
  }

  if (raw.includes("@") && !raw.startsWith("@")) {
    return getUserByEmail(raw.toLowerCase());
  }

  const digits = raw.replace(/\D/g, "");
  const normalizedPhoneDigits =
    digits.length === 9 ? `998${digits}` : digits.length >= 10 ? digits : "";

  if (normalizedPhoneDigits) {
    const phoneRows = await prisma.$queryRaw<UserAuthRow[]>`
      SELECT
        "id",
        "email",
        "emailVerifiedAt",
        "name",
        "avatarUrl",
        "role",
        "status",
        "passwordHash",
        "plainPass",
        "phone",
        "telegramUsername",
        "telegramChatId",
        "phoneVerifiedAt",
        "preferredRegion",
        "preferredDistrict",
        "preferredPropertyType",
        "preferredRentType",
        "preferredMinPrice",
        "preferredMaxPrice",
        "preferencesPromptDismissedAt",
        "createdAt",
        "updatedAt"
      FROM "User"
      WHERE REGEXP_REPLACE(COALESCE("phone", ''), '[^0-9]', '', 'g') = ${normalizedPhoneDigits}
      ORDER BY "phoneVerifiedAt" DESC NULLS LAST, "updatedAt" DESC
      LIMIT 1
    `;

    if (phoneRows[0]) {
      return normalizeAuthRow(phoneRows[0]);
    }
  }

  const cleanUsername = raw.replace(/^@+/, "").trim().toLowerCase();
  if (cleanUsername) {
    const usernameRows = await prisma.$queryRaw<UserAuthRow[]>`
      SELECT
        "id",
        "email",
        "emailVerifiedAt",
        "name",
        "avatarUrl",
        "role",
        "status",
        "passwordHash",
        "plainPass",
        "phone",
        "telegramUsername",
        "telegramChatId",
        "phoneVerifiedAt",
        "preferredRegion",
        "preferredDistrict",
        "preferredPropertyType",
        "preferredRentType",
        "preferredMinPrice",
        "preferredMaxPrice",
        "preferencesPromptDismissedAt",
        "createdAt",
        "updatedAt"
      FROM "User"
      WHERE LOWER(COALESCE("telegramUsername", '')) = ${cleanUsername}
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `;

    if (usernameRows[0]) {
      return normalizeAuthRow(usernameRows[0]);
    }
  }

  return getUserByEmail(raw.toLowerCase());
}

const publicUserColumns = Prisma.sql`
  "id",
  "email",
  "emailVerifiedAt",
  "name",
  "avatarUrl",
  "role",
  "status",
  "phone",
  "plainPass",
  "telegramUsername",
  "telegramChatId",
  "phoneVerifiedAt",
  "preferredRegion",
  "preferredDistrict",
  "preferredPropertyType",
  "preferredRentType",
  "preferredMinPrice",
  "preferredMaxPrice",
  "preferencesPromptDismissedAt",
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

export async function getUserByTelegramChatId(chatId: string) {
  const cleanId = chatId.trim();
  if (!cleanId) return null;

  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT ${publicUserColumns}
    FROM "User"
    WHERE "telegramChatId" = ${cleanId}
    ORDER BY "phoneVerifiedAt" DESC NULLS LAST, "updatedAt" DESC
    LIMIT 1
  `;

  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function getUserByTelegramUsername(username: string) {
  const clean = username.replace(/^@+/, "").trim().toLowerCase();
  if (!clean) return null;

  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT ${publicUserColumns}
    FROM "User"
    WHERE LOWER(COALESCE("telegramUsername", '')) = ${clean}
    ORDER BY "phoneVerifiedAt" DESC NULLS LAST, "updatedAt" DESC
    LIMIT 1
  `;

  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function createUserProfile(input: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  plainPass?: string | null;
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
      "plainPass",
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
      ${input.plainPass ?? null},
      ${phone},
      ${null},
      ${now},
      ${now}
    )
  `;

  return {
    id,
    email: input.email,
    emailVerifiedAt: null as Date | null,
    name: input.name,
    role: "USER" as UserRole
  };
}

export async function markEmailVerified(userId: string) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET "emailVerifiedAt" = ${now}, "updatedAt" = ${now}
    WHERE "id" = ${userId} AND "emailVerifiedAt" IS NULL
  `;
}

export async function getUserByGoogleId(googleId: string): Promise<UserAuthRecord | null> {
  const rows = await prisma.$queryRaw<UserAuthRow[]>`
    SELECT
      "id",
      "email",
      "emailVerifiedAt",
      "name",
      "avatarUrl",
      "role",
      "status",
      "passwordHash",
      "phone",
      "telegramUsername",
      "telegramChatId",
      "phoneVerifiedAt",
      "preferredRegion",
      "preferredDistrict",
      "preferredPropertyType",
      "preferredRentType",
      "preferredMinPrice",
      "preferredMaxPrice",
      "preferencesPromptDismissedAt",
      "createdAt",
      "updatedAt"
    FROM "User"
    WHERE "googleId" = ${googleId}
    LIMIT 1
  `;

  return rows[0] ? normalizeAuthRow(rows[0]) : null;
}

export async function linkGoogleAccount(userId: string, googleId: string) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "googleId" = ${googleId},
      "emailVerifiedAt" = COALESCE("emailVerifiedAt", ${now}),
      "updatedAt" = ${now}
    WHERE "id" = ${userId}
  `;

  const user = await getUserProfileById(userId);

  if (!user) {
    throw new Error("Unable to link Google account: user not found after update.");
  }

  return user;
}

export async function createUserFromGoogle(input: {
  email: string;
  googleId: string;
  name: string | null;
}) {
  const id = randomUUID();
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "User" (
      "id",
      "email",
      "name",
      "googleId",
      "emailVerifiedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.email},
      ${input.name},
      ${input.googleId},
      ${now},
      ${now},
      ${now}
    )
  `;

  const user = await getUserProfileById(id);

  if (!user) {
    throw new Error("Unable to create Google account: user not found after insert.");
  }

  return user;
}

export async function countUsersByStatus() {
  const [total, blocked] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "BLOCKED" } })
  ]);

  return { total, blocked };
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

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
  plainPass?: string | null
) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "passwordHash" = ${passwordHash},
      "plainPass" = ${plainPass ?? null},
      "updatedAt" = ${now}
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
      -- Changing the phone number invalidates any prior Telegram verification of the old number.
      "phoneVerifiedAt" = CASE
        WHEN "phone" IS NOT DISTINCT FROM ${input.phone} THEN "phoneVerifiedAt"
        ELSE NULL
      END,
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

/** Saves the profile photo immediately on upload, independent of the rest of the profile form. */
export async function updateUserAvatar(userId: string, avatarUrl: string) {
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET "avatarUrl" = ${avatarUrl}, "updatedAt" = ${now}
    WHERE "id" = ${userId}
  `;

  return getUserProfileById(userId);
}

/** Called by the Telegram bot process once the user shares their contact. */
export async function markPhoneVerifiedByTelegram(input: {
  userId: string;
  phone: string;
  telegramChatId: string;
  telegramUsername?: string | null;
}) {
  const now = new Date();
  const cleanUsername = input.telegramUsername?.replace(/^@+/, "").trim() || null;

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "phone" = ${input.phone},
      "phoneVerifiedAt" = ${now},
      "telegramChatId" = ${input.telegramChatId},
      "telegramUsername" = COALESCE(${cleanUsername}, "telegramUsername"),
      "updatedAt" = ${now}
    WHERE "id" = ${input.userId}
  `;

  return getUserProfileById(input.userId);
}

/**
 * Finds or creates a User when someone identifies via the Telegram Bot by
 * sharing their verified phone number.
 */
export async function upsertUserFromTelegramContact(input: {
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  telegramUsername?: string | null;
  telegramChatId: string;
  newPasswordHash: string;
  plainPass?: string | null;
  forceNewPassword?: boolean;
}) {
  const now = new Date();
  const digits = input.phone.replace(/\D/g, "");
  const normalizedPhone = `+${digits}`;
  const cleanUsername = input.telegramUsername?.replace(/^@+/, "").trim() || null;
  const telegramFullName = [input.firstName?.trim(), input.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  const existingRows = await prisma.$queryRaw<UserAuthRow[]>`
    SELECT
      "id",
      "email",
      "emailVerifiedAt",
      "name",
      "avatarUrl",
      "role",
      "status",
      "passwordHash",
      "plainPass",
      "phone",
      "telegramUsername",
      "telegramChatId",
      "phoneVerifiedAt",
      "preferredRegion",
      "preferredDistrict",
      "preferredPropertyType",
      "preferredRentType",
      "preferredMinPrice",
      "preferredMaxPrice",
      "preferencesPromptDismissedAt",
      "createdAt",
      "updatedAt"
    FROM "User"
    WHERE
      REGEXP_REPLACE(COALESCE("phone", ''), '[^0-9]', '', 'g') = ${digits}
      OR "telegramChatId" = ${input.telegramChatId}
    ORDER BY
      CASE WHEN REGEXP_REPLACE(COALESCE("phone", ''), '[^0-9]', '', 'g') = ${digits} THEN 0 ELSE 1 END,
      "updatedAt" DESC
    LIMIT 1
  `;

  const existing = existingRows[0];

  if (existing) {
    const shouldSetPassword = !existing.passwordHash || Boolean(input.forceNewPassword);
    const updatedName =
      existing.name && existing.name.trim() ? existing.name.trim() : telegramFullName || normalizedPhone;

    if (shouldSetPassword) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET
          "name" = ${updatedName},
          "phone" = ${normalizedPhone},
          "phoneVerifiedAt" = ${now},
          "telegramChatId" = ${input.telegramChatId},
          "telegramUsername" = COALESCE(${cleanUsername}, "telegramUsername"),
          "passwordHash" = ${input.newPasswordHash},
          "plainPass" = ${input.plainPass ?? null},
          "updatedAt" = ${now}
        WHERE "id" = ${existing.id}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "User"
        SET
          "name" = ${updatedName},
          "phone" = ${normalizedPhone},
          "phoneVerifiedAt" = ${now},
          "telegramChatId" = ${input.telegramChatId},
          "telegramUsername" = COALESCE(${cleanUsername}, "telegramUsername"),
          "updatedAt" = ${now}
        WHERE "id" = ${existing.id}
      `;
    }

    const updated = await getUserProfileById(existing.id);
    if (!updated) {
      throw new Error("User not found after Telegram update.");
    }

    return {
      user: updated,
      isNewUser: false,
      passwordSet: shouldSetPassword
    };
  }

  const id = randomUUID();
  const syntheticEmail = `${digits}@tg.uychi.site`;
  const displayName = telegramFullName || normalizedPhone;

  await prisma.$executeRaw`
    INSERT INTO "User" (
      "id",
      "email",
      "emailVerifiedAt",
      "name",
      "passwordHash",
      "plainPass",
      "phone",
      "phoneVerifiedAt",
      "telegramUsername",
      "telegramChatId",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${syntheticEmail},
      ${now},
      ${displayName},
      ${input.newPasswordHash},
      ${input.plainPass ?? null},
      ${normalizedPhone},
      ${now},
      ${cleanUsername},
      ${input.telegramChatId},
      ${now},
      ${now}
    )
  `;

  const created = await getUserProfileById(id);
  if (!created) {
    throw new Error("User not found after Telegram insert.");
  }

  return {
    user: created,
    isNewUser: true,
    passwordSet: true
  };
}
