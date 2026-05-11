import { createHash, randomBytes, randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";

export type StoredSessionKind = "USER" | "ADMIN_ENV";

type StoredUserSessionRow = {
  userId: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  expiresAt: Date;
};

type StoredAdminSessionRow = {
  email: string | null;
  expiresAt: Date;
};

export type ActiveSessionRow = {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createRawToken() {
  return randomBytes(32).toString("hex");
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days
const SLIDING_REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24 * 7; // Refresh if < 7 days remain

export async function createStoredSession(input: {
  kind: StoredSessionKind;
  userId?: string | null;
  email?: string | null;
  ttlSeconds: number;
}) {
  const token = createRawToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.ttlSeconds * 1000);

  await prisma.$executeRaw`
    INSERT INTO "AuthSession" (
      "id",
      "tokenHash",
      "kind",
      "userId",
      "email",
      "expiresAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${randomUUID()},
      ${tokenHash},
      CAST(${input.kind} AS "AuthSessionKind"),
      ${input.userId ?? null},
      ${input.email ?? null},
      ${expiresAt},
      ${now},
      ${now}
    )
  `;

  return token;
}

export async function getStoredUserSession(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await prisma.$queryRaw<StoredUserSessionRow[]>`
    SELECT
      u."id" AS "userId",
      u."email",
      u."name",
      u."role",
      u."status",
      s."expiresAt"
    FROM "AuthSession" s
    INNER JOIN "User" u ON u."id" = s."userId"
    WHERE
      s."tokenHash" = ${tokenHash}
      AND s."kind" = CAST(${"USER"} AS "AuthSessionKind")
      AND s."expiresAt" > ${now}
    LIMIT 1
  `;

  const session = rows[0] ?? null;

  // Sliding window: if less than 7 days remain, extend the session in the DB.
  if (session) {
    const remainingMs = session.expiresAt.getTime() - now.getTime();
    if (remainingMs < SLIDING_REFRESH_THRESHOLD_SECONDS * 1000) {
      const newExpiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
      await prisma.$executeRaw`
        UPDATE "AuthSession"
        SET "expiresAt" = ${newExpiresAt}, "updatedAt" = ${now}
        WHERE "tokenHash" = ${tokenHash}
      `;
    }
  }

  return session;
}

export async function getStoredAdminSession(token: string) {
  const tokenHash = hashToken(token);
  const rows = await prisma.$queryRaw<StoredAdminSessionRow[]>`
    SELECT
      "email",
      "expiresAt"
    FROM "AuthSession"
    WHERE
      "tokenHash" = ${tokenHash}
      AND "kind" = CAST(${"ADMIN_ENV"} AS "AuthSessionKind")
      AND "expiresAt" > ${new Date()}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function deleteStoredSession(token?: string | null) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.$executeRaw`
    DELETE FROM "AuthSession" WHERE "tokenHash" = ${tokenHash}
  `;
}

export async function deleteStoredUserSessionsByUserId(userId: string) {
  await prisma.$executeRaw`
    DELETE FROM "AuthSession"
    WHERE "userId" = ${userId} AND "kind" = CAST(${"USER"} AS "AuthSessionKind")
  `;
}

/**
 * Revoke a single session by its ID, scoped to the given userId for safety.
 */
export async function deleteStoredSessionById(
  sessionId: string,
  userId: string
) {
  await prisma.$executeRaw`
    DELETE FROM "AuthSession"
    WHERE "id" = ${sessionId} AND "userId" = ${userId}
  `;
}

/**
 * Returns all active USER sessions for a user.
 * Marks the one matching currentTokenHash as isCurrent.
 * Never exposes the raw token or tokenHash to callers.
 */
export async function getActiveUserSessions(
  userId: string,
  currentTokenHash: string
): Promise<ActiveSessionRow[]> {
  const now = new Date();

  type RawRow = {
    id: string;
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
  };

  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT "id", "tokenHash", "createdAt", "expiresAt"
    FROM "AuthSession"
    WHERE
      "userId" = ${userId}
      AND "kind" = CAST(${"USER"} AS "AuthSessionKind")
      AND "expiresAt" > ${now}
    ORDER BY "createdAt" DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    isCurrent: row.tokenHash === currentTokenHash
  }));
}
