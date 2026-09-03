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

/** Digits only, so "+998 90 111-88-77" and "998901118877" compare equal. */
export function normalizePhoneDigits(phone: string | null | undefined) {
  return (phone ?? "").replace(/\D/g, "");
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
