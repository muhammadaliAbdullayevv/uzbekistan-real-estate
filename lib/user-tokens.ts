import { createHash, randomBytes, randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";

export type UserTokenTypeValue = "VERIFY_EMAIL" | "RESET_PASSWORD";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createRawToken() {
  return randomBytes(32).toString("hex");
}

export async function createUserToken(input: {
  userId: string;
  type: UserTokenTypeValue;
  ttlMinutes: number;
}) {
  const token = createRawToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.ttlMinutes * 60 * 1000);

  // Delete any existing token of this type for the user before creating a new one.
  await prisma.$executeRaw`
    DELETE FROM "UserToken"
    WHERE "userId" = ${input.userId} AND "type" = CAST(${input.type} AS "UserTokenType")
  `;

  await prisma.$executeRaw`
    INSERT INTO "UserToken" (
      "id",
      "tokenHash",
      "type",
      "userId",
      "expiresAt",
      "consumedAt",
      "createdAt"
    )
    VALUES (
      ${randomUUID()},
      ${tokenHash},
      CAST(${input.type} AS "UserTokenType"),
      ${input.userId},
      ${expiresAt},
      ${null},
      ${now}
    )
  `;

  return { token, expiresAt };
}

type ConsumedRow = { userId: string };

/**
 * Atomically validates and consumes a user token in a single UPDATE...RETURNING.
 * This eliminates the race condition of a separate SELECT + UPDATE — only one
 * concurrent call can successfully update the row (because consumedAt IS NULL
 * is part of the WHERE clause and evaluated atomically by the DB engine).
 *
 * Returns the userId if consumed successfully, null otherwise (expired, already
 * used, or not found).
 */
export async function consumeUserToken(
  token: string,
  type: UserTokenTypeValue
): Promise<string | null> {
  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await prisma.$queryRaw<ConsumedRow[]>`
    UPDATE "UserToken"
    SET "consumedAt" = ${now}
    WHERE
      "tokenHash" = ${tokenHash}
      AND "type" = CAST(${type} AS "UserTokenType")
      AND "consumedAt" IS NULL
      AND "expiresAt" > ${now}
    RETURNING "userId"
  `;

  return rows[0]?.userId ?? null;
}

/**
 * Non-consuming status check (e.g. for showing the reset-password form before
 * the user submits). Does not mark the token as consumed.
 */
export async function getUserTokenStatus(token: string, type: UserTokenTypeValue) {
  const tokenHash = hashToken(token);

  type StatusRow = { userId: string; expiresAt: Date; consumedAt: Date | null };

  const rows = await prisma.$queryRaw<StatusRow[]>`
    SELECT "userId", "expiresAt", "consumedAt"
    FROM "UserToken"
    WHERE "tokenHash" = ${tokenHash} AND "type" = CAST(${type} AS "UserTokenType")
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return { valid: false, userId: null } as const;
  if (row.consumedAt || row.expiresAt <= new Date()) {
    return { valid: false, userId: row.userId } as const;
  }
  return { valid: true, userId: row.userId } as const;
}
