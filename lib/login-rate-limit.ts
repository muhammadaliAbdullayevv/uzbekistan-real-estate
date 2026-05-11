/**
 * DB-backed login attempt limiting.
 * Uses PostgreSQL via Prisma raw SQL with an atomic upsert to avoid race
 * conditions and to survive server restarts / multi-instance deployments.
 */

import { prisma } from "@/lib/db";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILURES = 5;
const REGISTER_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_REGISTER_ATTEMPTS = 5;
const FORGOT_PASSWORD_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FORGOT_PASSWORD_ATTEMPTS = 3;

export function loginRateLimitKey(ip: string, normalizedEmail: string) {
  return `${ip}::${normalizedEmail.toLowerCase()}`;
}

export function parseClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

type AttemptRow = {
  failures: number;
  windowStart: Date;
};

type RateLimitPolicy = {
  windowMs: number;
  maxFailures: number;
};

function loginPolicy(): RateLimitPolicy {
  return {
    windowMs: WINDOW_MS,
    maxFailures: MAX_FAILURES
  };
}

function registerPolicy(): RateLimitPolicy {
  return {
    windowMs: REGISTER_WINDOW_MS,
    maxFailures: MAX_REGISTER_ATTEMPTS
  };
}

function forgotPasswordPolicy(): RateLimitPolicy {
  return {
    windowMs: FORGOT_PASSWORD_WINDOW_MS,
    maxFailures: MAX_FORGOT_PASSWORD_ATTEMPTS
  };
}

async function isRateLimited(key: string, policy: RateLimitPolicy): Promise<boolean> {
  const windowCutoff = new Date(Date.now() - policy.windowMs);

  const rows = await prisma.$queryRaw<AttemptRow[]>`
    SELECT "failures", "windowStart"
    FROM "LoginAttempt"
    WHERE "key" = ${key} AND "windowStart" > ${windowCutoff}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return false;
  return row.failures >= policy.maxFailures;
}

async function recordRateLimitEvent(key: string, policy: RateLimitPolicy): Promise<void> {
  const now = new Date();
  const windowCutoff = new Date(Date.now() - policy.windowMs);

  // Atomic upsert:
  // - If no row exists, insert with failures = 1.
  // - If row is within the current window, increment failures.
  // - If row is outside the window (expired), reset to failures = 1.
  await prisma.$executeRaw`
    INSERT INTO "LoginAttempt" ("key", "failures", "windowStart", "updatedAt")
    VALUES (${key}, 1, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE
    SET
      "failures" = CASE
        WHEN "LoginAttempt"."windowStart" < ${windowCutoff}
          THEN 1
        ELSE "LoginAttempt"."failures" + 1
      END,
      "windowStart" = CASE
        WHEN "LoginAttempt"."windowStart" < ${windowCutoff}
          THEN ${now}
        ELSE "LoginAttempt"."windowStart"
      END,
      "updatedAt" = ${now}
  `;
}

export async function clearLoginFailures(key: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "LoginAttempt" WHERE "key" = ${key}
  `;
}

export function registerRateLimitKey(ip: string) {
  return `${ip}::register`;
}

export function forgotPasswordRateLimitKey(ip: string, normalizedEmail: string) {
  return `${ip}::forgot-password::${normalizedEmail.toLowerCase()}`;
}

export async function isLoginRateLimited(key: string): Promise<boolean> {
  return isRateLimited(key, loginPolicy());
}

export async function recordLoginFailure(key: string): Promise<void> {
  await recordRateLimitEvent(key, loginPolicy());
}

export async function isRegisterRateLimited(key: string): Promise<boolean> {
  return isRateLimited(key, registerPolicy());
}

export async function recordRegisterAttempt(key: string): Promise<void> {
  await recordRateLimitEvent(key, registerPolicy());
}

export async function isForgotPasswordRateLimited(key: string): Promise<boolean> {
  return isRateLimited(key, forgotPasswordPolicy());
}

export async function recordForgotPasswordAttempt(key: string): Promise<void> {
  await recordRateLimitEvent(key, forgotPasswordPolicy());
}
