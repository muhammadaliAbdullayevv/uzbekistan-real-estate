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
