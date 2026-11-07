import { createHash, createHmac, randomBytes, randomInt, randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";
import { getUserProfileById } from "@/lib/user-data";
import { createUserToken } from "@/lib/user-tokens";

export function getTelegramBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME?.trim() || null;
}

export function hasTelegramBotConfig() {
  return Boolean(getTelegramBotUsername());
}

export function getTelegramVerifyDeepLink(token: string) {
  const username = getTelegramBotUsername();

  if (!username) {
    throw new Error("Telegram bot is not configured.");
  }

  return `https://t.me/${username}?start=${token}`;
}

export function getTelegramLoginDeepLink(token: string) {
  const username = getTelegramBotUsername();

  if (!username) {
    throw new Error("Telegram bot is not configured.");
  }

  return `https://t.me/${username}?start=login_${token}`;
}

/** Digits only, so "+998 90 111-88-77" and "998901118877" compare equal. */
export function normalizePhoneDigits(phone: string | null | undefined) {
  return (phone ?? "").replace(/\D/g, "");
}

function hashAttemptToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generates an easy-to-type, memorable 10-character password for cross-device browser login,
 * e.g. "uychi4829k".
 */
export function generateMemorablePassword() {
  const digits = String(randomInt(1000, 9999));
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const suffix = letters[randomInt(0, letters.length)];
  return `uychi${digits}${suffix}`;
}

export async function createTelegramLoginAttempt(ttlMinutes = 20) {
  // 20 bytes = 40 hex chars. Prefix "login_" + 40 chars = 46 chars (well within Telegram's 64-char /start limit).
  const token = randomBytes(20).toString("hex");
  const tokenHash = hashAttemptToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  await prisma.$executeRaw`
    INSERT INTO "TelegramAuthAttempt" (
      "id",
      "tokenHash",
      "userId",
      "plainPass",
      "expiresAt",
      "completedAt",
      "consumedAt",
      "createdAt"
    )
    VALUES (
      ${randomUUID()},
      ${tokenHash},
      ${null},
      ${null},
      ${expiresAt},
      ${null},
      ${null},
      ${now}
    )
  `;

  return {
    token,
    botUrl: getTelegramLoginDeepLink(token),
    expiresAt
  };
}

type AttemptRow = {
  id: string;
  userId: string | null;
  plainPass: string | null;
  expiresAt: Date;
  completedAt: Date | null;
  consumedAt: Date | null;
};

export async function getTelegramLoginAttemptStatus(token: string) {
  const tokenHash = hashAttemptToken(token);
  const rows = await prisma.$queryRaw<AttemptRow[]>`
    SELECT "id", "userId", "plainPass", "expiresAt", "completedAt", "consumedAt"
    FROM "TelegramAuthAttempt"
    WHERE "tokenHash" = ${tokenHash}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return { status: "invalid" as const };
  }
  if (row.consumedAt || row.expiresAt <= new Date()) {
    return { status: "expired" as const };
  }
  if (row.completedAt && row.userId) {
    return { status: "completed" as const };
  }
  return { status: "pending" as const };
}

export async function completeTelegramLoginAttempt(input: {
  token: string;
  userId: string;
  plainPass?: string | null;
}): Promise<boolean> {
  const tokenHash = hashAttemptToken(input.token);
  const now = new Date();

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    UPDATE "TelegramAuthAttempt"
    SET
      "userId" = ${input.userId},
      "plainPass" = ${input.plainPass ?? null},
      "completedAt" = ${now}
    WHERE
      "tokenHash" = ${tokenHash}
      AND "completedAt" IS NULL
      AND "consumedAt" IS NULL
      AND "expiresAt" > ${now}
    RETURNING "id"
  `;

  return rows.length > 0;
}

export async function consumeTelegramLoginAttempt(token: string): Promise<{
  userId: string;
  plainPass: string | null;
} | null> {
  const tokenHash = hashAttemptToken(token);
  const now = new Date();

  const rows = await prisma.$queryRaw<Array<{ userId: string | null; plainPass: string | null }>>`
    UPDATE "TelegramAuthAttempt"
    SET "consumedAt" = ${now}
    WHERE
      "tokenHash" = ${tokenHash}
      AND "completedAt" IS NOT NULL
      AND "userId" IS NOT NULL
      AND "consumedAt" IS NULL
      AND "expiresAt" > ${now}
    RETURNING "userId", "plainPass"
  `;

  const row = rows[0];
  if (!row?.userId) {
    return null;
  }

  return {
    userId: row.userId,
    plainPass: row.plainPass
  };
}

export type TelegramVerifyRedirectResult =
  | { ok: true; url: string }
  | { ok: false; errorCode: "not-configured" | "no-phone" };

/**
 * Shared by the dedicated start route and the profile-save form (whose
 * "verify" button submits here in the same request so a freshly typed phone
 * number doesn't need a separate save step first).
 */
export async function createTelegramVerifyRedirect(
  userId: string
): Promise<TelegramVerifyRedirectResult> {
  if (!hasTelegramBotConfig()) {
    return { ok: false, errorCode: "not-configured" };
  }

  const user = await getUserProfileById(userId);

  if (!user?.phone) {
    return { ok: false, errorCode: "no-phone" };
  }

  const { token } = await createUserToken({ userId, type: "PHONE_VERIFY", ttlMinutes: 20 });

  return { ok: true, url: getTelegramVerifyDeepLink(token) };
}

/**
 * Creates a ready-to-consume one-time login token for a user.
 * Used when the Telegram Bot sends a 1-tap direct login link to the user.
 */
export async function createCompletedTelegramLoginToken(
  userId: string,
  plainPass?: string | null,
  ttlMinutes = 120
): Promise<string> {
  const token = randomBytes(24).toString("hex");
  const tokenHash = hashAttemptToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  await prisma.$executeRaw`
    INSERT INTO "TelegramAuthAttempt" (
      "id",
      "tokenHash",
      "userId",
      "plainPass",
      "expiresAt",
      "completedAt",
      "createdAt"
    )
    VALUES (
      ${randomUUID()},
      ${tokenHash},
      ${userId},
      ${plainPass ?? null},
      ${expiresAt},
      ${now},
      ${now}
    )
  `;

  return token;
}

export type TelegramWebAppDataUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256
 * per official Telegram Bot API specification.
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): { valid: boolean; user?: TelegramWebAppDataUser } {
  try {
    const raw = initData.trim();
    if (!raw) return { valid: false };

    const params = new URLSearchParams(raw);
    const hash = params.get("hash");
    if (!hash) return { valid: false };

    params.delete("hash");

    const authDateStr = params.get("auth_date");
    if (!authDateStr) return { valid: false };

    const authDate = parseInt(authDateStr, 10);
    const now = Math.floor(Date.now() / 1000);
    // Allow up to 48 hours for valid initData
    if (now - authDate > 86400 * 2) {
      return { valid: false };
    }

    const pairs: string[] = [];
    Array.from(params.keys())
      .sort()
      .forEach((key) => {
        const val = params.get(key);
        if (val !== null) {
          pairs.push(`${key}=${val}`);
        }
      });
    const dataCheckString = pairs.join("\n");

    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return { valid: false };
    }

    const userRaw = params.get("user");
    const user = userRaw ? (JSON.parse(userRaw) as TelegramWebAppDataUser) : undefined;
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

