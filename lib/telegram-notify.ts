import { getAbsoluteUrl } from "@/lib/site";
import { getUserProfileById } from "@/lib/user-data";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

/**
 * Best-effort chat push: failures here must never block sending a message on
 * the site itself, same rule as verification email delivery.
 */
export async function sendTelegramNotification(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      console.error("Telegram notify failed:", payload?.description ?? response.status);
    }
  } catch (error) {
    console.error("Telegram notify failed:", error);
  }
}

/**
 * Best-effort: lets a submitter know their listing was rejected instead of
 * it just silently never appearing. No-ops for listings with no user (e.g.
 * demo data) or whose submitter hasn't linked Telegram via phone
 * verification yet -- same silent-skip behavior already used for the
 * new-listing and new-message notifications.
 */
export async function notifySubmitterOfRejection(listing: {
  title: string;
  userId: string | null;
}) {
  if (!listing.userId) {
    return;
  }

  const submitter = await getUserProfileById(listing.userId);

  if (!submitter?.telegramChatId) {
    return;
  }

  const link = getAbsoluteUrl("/my-listings");
  const text = [`❌ E'loningiz rad etildi`, listing.title, "", link].join("\n");

  await sendTelegramNotification(submitter.telegramChatId, text);
}
