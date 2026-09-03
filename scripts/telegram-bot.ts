/**
 * Standalone long-polling Telegram bot that verifies a user's phone number.
 *
 * Flow:
 * 1. The website creates a short-lived PHONE_VERIFY token and sends the user
 *    to https://t.me/<bot>?start=<token>.
 * 2. This bot receives /start <token>, checks it's valid (without consuming
 *    it yet), and asks the user to share their Telegram-account contact via
 *    a native "request_contact" button -- this is what actually proves the
 *    phone number, not just that some Telegram account clicked the link.
 * 3. Once the user taps share, the bot consumes the token and compares the
 *    shared phone number against the one already saved on the website for
 *    that user. Only an exact match (digits only) gets marked verified --
 *    a mismatch sends guidance back instead of silently accepting it.
 *
 * Run standalone (not part of the Next.js process): `npm run telegram-bot`.
 * Requires TELEGRAM_BOT_TOKEN in the environment (see .env.example).
 */
import "dotenv/config";

import { normalizePhoneDigits } from "../lib/telegram-verification";
import { getUserProfileById, markPhoneVerifiedByTelegram } from "../lib/user-data";
import { consumeUserToken, getUserTokenStatus } from "../lib/user-tokens";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!BOT_TOKEN) {
  console.error(
    "TELEGRAM_BOT_TOKEN is not set — the Telegram verification bot has nothing to run. Exiting."
  );
  process.exit(0);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Bridges "/start <token>" to the contact-share that follows it. In-memory
// only: if the process restarts mid-flow, the user just taps the link again.
const pendingByChat = new Map<number, string>();

type TelegramChat = { id: number };
type TelegramContact = { phone_number: string };
type TelegramMessage = {
  chat: TelegramChat;
  text?: string;
  contact?: TelegramContact;
};
type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

async function callTelegramApi<T = unknown>(
  method: string,
  body: Record<string, unknown>
): Promise<T | null> {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as { ok: boolean; result?: T; description?: string };

  if (!payload.ok) {
    console.error(`Telegram API ${method} failed:`, payload.description);
    return null;
  }

  return payload.result ?? null;
}

function sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return callTelegramApi("sendMessage", { chat_id: chatId, text, ...extra });
}

async function handleStart(chatId: number, token: string) {
  const status = await getUserTokenStatus(token, "PHONE_VERIFY");

  if (!status.valid) {
    await sendMessage(
      chatId,
      "Bu havola yaroqsiz yoki muddati tugagan. Saytga qaytib, telefon raqamini qayta tasdiqlashga urinib ko'ring."
    );
    return;
  }

  pendingByChat.set(chatId, token);

  await sendMessage(chatId, "Telefon raqamingizni tasdiqlash uchun quyidagi tugmani bosing:", {
    reply_markup: {
      keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
}

async function handleContact(chatId: number, contact: TelegramContact) {
  const token = pendingByChat.get(chatId);

  if (!token) {
    await sendMessage(
      chatId,
      'Iltimos, avval saytda "Telegram orqali tasdiqlash" tugmasini bosing, so\'ng shu botga qayting.'
    );
    return;
  }

  const userId = await consumeUserToken(token, "PHONE_VERIFY");
  pendingByChat.delete(chatId);

  if (!userId) {
    await sendMessage(chatId, "Havola muddati tugagan. Saytda qayta urinib ko'ring.", {
      reply_markup: { remove_keyboard: true }
    });
    return;
  }

  const telegramPhone = contact.phone_number.startsWith("+")
    ? contact.phone_number
    : `+${contact.phone_number}`;

  const user = await getUserProfileById(userId);

  if (!user?.phone) {
    await sendMessage(
      chatId,
      "Saytdagi profilingizda telefon raqami kiritilmagan. Avval saytda raqamingizni kiriting va saqlang, so'ng qayta urinib ko'ring.",
      { reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  if (normalizePhoneDigits(user.phone) !== normalizePhoneDigits(telegramPhone)) {
    await sendMessage(
      chatId,
      `❗ Siz ulashgan raqam (${telegramPhone}) saytda kiritilgan raqamdan (${user.phone}) farq qiladi. Saytdagi profilda ushbu Telegram akkauntingizga tegishli raqamni kiriting va "Telegram orqali tasdiqlash" tugmasini qaytadan bosing.`,
      { reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  await markPhoneVerifiedByTelegram({ userId, phone: user.phone, telegramChatId: String(chatId) });

  await sendMessage(chatId, `✅ Telefon raqamingiz (${user.phone}) muvaffaqiyatli tasdiqlandi!`, {
    reply_markup: { remove_keyboard: true }
  });
}

async function handleUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message) {
    return;
  }

  const chatId = message.chat.id;

  if (message.text?.startsWith("/start")) {
    const token = message.text.split(" ")[1];
    if (token) {
      await handleStart(chatId, token);
    } else {
      await sendMessage(
        chatId,
        'Saytdagi "Telegram orqali tasdiqlash" tugmasi orqali bu botga kiring.'
      );
    }
    return;
  }

  if (message.contact) {
    await handleContact(chatId, message.contact);
  }
}

async function poll() {
  let offset = 0;

  console.log("Telegram verification bot started, polling for updates...");

  for (;;) {
    try {
      const response = await fetch(`${API_BASE}/getUpdates?timeout=30&offset=${offset}`);
      const payload = (await response.json()) as { ok: boolean; result?: TelegramUpdate[] };

      if (!payload.ok || !payload.result) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      for (const update of payload.result) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    } catch (error) {
      console.error("Polling error:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

poll();
