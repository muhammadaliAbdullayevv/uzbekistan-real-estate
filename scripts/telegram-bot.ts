/**
 * Standalone long-polling Telegram bot. Two independent flows:
 *
 * 1. Phone verification: the website creates a short-lived PHONE_VERIFY
 *    token and sends the user to https://t.me/<bot>?start=<token>. The bot
 *    asks them to share their Telegram-account contact via a native
 *    "request_contact" button -- this is what actually proves the phone
 *    number, not just that some Telegram account clicked the link. Only an
 *    exact match against the number already saved on the website gets
 *    marked verified.
 *
 * 2. Listing submission (/addlisting): lets a property owner post their own
 *    listing by chatting with the bot instead of using the website form --
 *    they describe the property in their own words and send photos, Gemini
 *    parses that into structured fields, the bot shows a summary for them
 *    to confirm, and only then creates a PENDING listing (the same
 *    moderation queue every other submission goes through -- nothing from
 *    this flow bypasses owner review). Created ownerless (ListingId's
 *    userId is nullable) since the submitter doesn't need a website
 *    account; contact info lives on the listing row itself, same as any
 *    other listing.
 *
 * Run standalone (not part of the Next.js process): `npm run telegram-bot`.
 * Requires TELEGRAM_BOT_TOKEN in the environment (see .env.example).
 */
import "dotenv/config";

import { randomUUID } from "node:crypto";

import { ListingStatus, Prisma } from "@prisma/client";

import { prisma } from "../lib/db";
import { getDistrictCentroid } from "../lib/district-coordinates";
import { CURRENCIES, LISTING_TYPES, PROPERTY_TYPES, RENT_TYPES } from "../lib/constants";
import { runGeminiJson } from "../lib/gemini";
import { saveUploadedImageLocally } from "../lib/local-upload";
import { UZBEKISTAN_REGIONS } from "../lib/locations";
import { hashPassword } from "../lib/password";
import { getOwnerDashboardPath, getOwnerEmail } from "../lib/owner";
import { getAbsoluteUrl } from "../lib/site";
import { sendTelegramNotification } from "../lib/telegram-notify";
import {
  completeTelegramLoginAttempt,
  createCompletedTelegramLoginToken,
  generateMemorablePassword,
  getTelegramLoginAttemptStatus,
  normalizePhoneDigits
} from "../lib/telegram-verification";
import {
  getUserByEmail,
  getUserProfileById,
  markPhoneVerifiedByTelegram,
  upsertUserFromTelegramContact
} from "../lib/user-data";
import { consumeUserToken, getUserTokenStatus } from "../lib/user-tokens";
import { listingInputSchema } from "../lib/validations/listing";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!BOT_TOKEN) {
  console.error(
    "TELEGRAM_BOT_TOKEN is not set — the Telegram verification bot has nothing to run. Exiting."
  );
  process.exit(0);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const FILE_BASE = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

type PendingChatState =
  | { kind: "phone_verify"; token: string }
  | { kind: "website_login"; token: string }
  | { kind: "direct_credentials"; forceNewPassword: boolean };

// Bridges "/start <token>" or "/parol" to the contact-share that follows it.
const pendingByChat = new Map<number, PendingChatState>();

type TelegramChat = { id: number };
type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};
type TelegramContact = {
  phone_number: string;
  first_name?: string;
  last_name?: string;
  user_id?: number;
};
type TelegramPhotoSize = { file_id: string; width: number; height: number };
type TelegramMessage = {
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  contact?: TelegramContact;
  photo?: TelegramPhotoSize[];
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

const NEW_PASSWORD_BUTTON = "🔑 Yangi parol olish";
const ADD_LISTING_BUTTON = "🏠 E'lon joylash";

async function handleStart(chatId: number, rawToken?: string) {
  listingDraftByChat.delete(chatId);

  if (rawToken === "parol") {
    pendingByChat.set(chatId, { kind: "direct_credentials", forceNewPassword: true });
    await sendMessage(
      chatId,
      "🔑 Yangi Login va Parol olish uchun quyidagi «📱 Telefon raqamimni ulashish» tugmasini bosing:",
      {
        reply_markup: {
          keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
    return;
  }

  if (rawToken?.startsWith("login_")) {
    const loginToken = rawToken.slice("login_".length).trim();
    const attemptStatus = await getTelegramLoginAttemptStatus(loginToken);

    if (attemptStatus.status !== "pending") {
      pendingByChat.set(chatId, { kind: "direct_credentials", forceNewPassword: true });
      await sendMessage(
        chatId,
        "👋 Uychi.site botiga xush kelibsiz!\n\nSaytga kirish uchun Login va Parol olish uchun pastdagi «📱 Telefon raqamimni ulashish» tugmasini bosing:",
        {
          reply_markup: {
            keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        }
      );
      return;
    }

    pendingByChat.set(chatId, { kind: "website_login", token: loginToken });

    await sendMessage(
      chatId,
      "👋 Uychi.site tizimiga xush kelibsiz!\n\nSaytga avtomatik kirish hamda shaxsiy Login va Parolingizni olish uchun pastdagi «📱 Telefon raqamimni ulashish» tugmasini bosing:",
      {
        reply_markup: {
          keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
    return;
  }

  if (rawToken) {
    const status = await getUserTokenStatus(rawToken, "PHONE_VERIFY");

    if (!status.valid) {
      await sendMessage(
        chatId,
        "Bu havola yaroqsiz yoki muddati tugagan. Saytga qaytib, telefon raqamini qayta tasdiqlashga urinib ko'ring."
      );
      return;
    }

    pendingByChat.set(chatId, { kind: "phone_verify", token: rawToken });

    await sendMessage(chatId, "Telefon raqamingizni tasdiqlash uchun quyidagi tugmani bosing:", {
      reply_markup: {
        keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
    return;
  }

  // Direct start or /start register: instant 1-tap phone registration
  pendingByChat.set(chatId, { kind: "direct_credentials", forceNewPassword: true });

  await sendMessage(
    chatId,
    [
      "👋 Assalomu alaykum!",
      "🏠 Uychi.site rasmiy botiga xush kelibsiz!",
      "",
      "Ro'yxatdan o'tish va Login hamda Parolingizni olish uchun pastdagi «📱 Telefon raqamimni ulashish» tugmasini bosing:"
    ].join("\n"),
    {
      reply_markup: {
        keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  );
}

async function handleContact(chatId: number, message: TelegramMessage, contact: TelegramContact) {
  // Security guard: ensure the shared contact belongs to the sender's own Telegram account
  if (contact.user_id && message.from?.id && contact.user_id !== message.from.id) {
    await sendMessage(
      chatId,
      "❗ Iltimos, faqat o'zingizning Telegram akkauntingizga biriktirilgan telefon raqamni ulashing («📱 Telefon raqamimni ulashish» tugmasi orqali)."
    );
    return;
  }

  const pending = pendingByChat.get(chatId) ?? {
    kind: "direct_credentials" as const,
    forceNewPassword: true
  };
  pendingByChat.delete(chatId);

  const telegramPhone = contact.phone_number.startsWith("+")
    ? contact.phone_number
    : `+${contact.phone_number}`;

  if (pending.kind === "phone_verify") {
    const userId = await consumeUserToken(pending.token, "PHONE_VERIFY");

    if (!userId) {
      await sendMessage(chatId, "Havola muddati tugagan. Saytda qayta urinib ko'ring.", {
        reply_markup: { remove_keyboard: true }
      });
      return;
    }

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

    await markPhoneVerifiedByTelegram({
      userId,
      phone: user.phone,
      telegramChatId: String(chatId),
      telegramUsername: message.from?.username
    });

    await sendMessage(chatId, `✅ Telefon raqamingiz (${user.phone}) muvaffaqiyatli tasdiqlandi!`, {
      reply_markup: { remove_keyboard: true }
    });
    return;
  }

  // Website login OR Direct credentials flow:
  const plainPass = generateMemorablePassword();
  const passwordHash = await hashPassword(plainPass);
  const forceNewPassword =
    pending.kind === "direct_credentials" ? pending.forceNewPassword : true;

  const { user, passwordSet } = await upsertUserFromTelegramContact({
    phone: telegramPhone,
    firstName: message.from?.first_name ?? contact.first_name ?? null,
    lastName: message.from?.last_name ?? contact.last_name ?? null,
    telegramUsername: message.from?.username ?? null,
    telegramChatId: String(chatId),
    newPasswordHash: passwordHash,
    plainPass,
    forceNewPassword
  });

  if (pending.kind === "website_login") {
    await completeTelegramLoginAttempt({
      token: pending.token,
      userId: user.id,
      plainPass: passwordSet ? plainPass : null
    });
  }

  const directToken = await createCompletedTelegramLoginToken(user.id, plainPass);
  const directLoginUrl = getAbsoluteUrl(`/api/auth/telegram/direct?t=${directToken}&next=/account`);

  await sendMessage(
    chatId,
    [
      "🎉 Hisobingiz muvaffaqiyatli tasdiqlandi!",
      "",
      `👤 Ism: ${user.name || "Foydalanuvchi"}`,
      `📞 Telefon: ${user.phone}`,
      user.telegramUsername ? `💬 Telegram: @${user.telegramUsername}` : "",
      "",
      "🔐 Saytga kirish ma'lumotlaringiz:",
      `• Login (Telefon): ${user.phone}`,
      `• Parol: ${plainPass}`,
      "",
      "Quyidagi tugmani bosib darhol saytga kirishingiz mumkin 👇"
    ]
      .filter(Boolean)
      .join("\n"),
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🌐 Saytga kirish (uychi.site)",
              url: directLoginUrl
            }
          ]
        ]
      }
    }
  );
}

// --- Listing submission flow -----------------------------------------

const DONE_LABEL = "✅ Tayyor";
const CANCEL_LABEL = "❌ Bekor qilish";
const CONFIRM_LABEL = "✅ Tasdiqlash va joylashtirish";
const SHARE_PHONE_LABEL = "📱 Telefon raqamimni ulashish";

type ListingDraft = {
  stage: "collecting" | "awaiting_phone" | "confirming";
  texts: string[];
  photoFileIds: string[];
  parsed?: ParsedListing;
};

type ParsedListing = {
  title: string;
  description: string;
  listingType: (typeof LISTING_TYPES)[number];
  propertyType: (typeof PROPERTY_TYPES)[number];
  rentType: (typeof RENT_TYPES)[number] | null;
  currency: (typeof CURRENCIES)[number];
  price: number;
  region: (typeof UZBEKISTAN_REGIONS)[number];
  district: string;
  address: string;
  rooms: number;
  area: number;
  phone: string | null;
};

const listingDraftByChat = new Map<number, ListingDraft>();

const listingExtractionSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short listing title, e.g. '3-room flat for rent in Chilonzor'." },
    description: {
      type: "string",
      description: "A cleaned-up, complete description in the same language the user wrote in -- expand abbreviations, keep it natural, at least a few sentences. Never invent details the user didn't mention."
    },
    listingType: { type: "string", enum: [...LISTING_TYPES], description: "rent or sale" },
    propertyType: { type: "string", enum: [...PROPERTY_TYPES] },
    rentType: {
      type: "string",
      enum: [...RENT_TYPES],
      description: "Required when listingType is rent -- monthly unless the user specifically says daily/short-term."
    },
    currency: { type: "string", enum: [...CURRENCIES] },
    price: { type: "number" },
    region: {
      type: "string",
      enum: [...UZBEKISTAN_REGIONS],
      description: "Map the user's region/city name to exactly one of these enum values, e.g. 'Toshkent shahri'/'Tashkent' -> 'Tashkent City', 'Toshkent viloyati' -> 'Tashkent Region'."
    },
    district: { type: "string", description: "District or city/town name, free text." },
    address: {
      type: "string",
      description: "Street/landmark if mentioned. If the user gave no specific address, repeat the district name here -- never invent a street."
    },
    rooms: { type: "number" },
    area: { type: "number", description: "Floor area in square meters." },
    phone: {
      type: "string",
      description: "A phone number ONLY if the user actually included one in their message. Omit this field entirely otherwise -- never invent one."
    }
  },
  required: [
    "title",
    "description",
    "listingType",
    "propertyType",
    "currency",
    "price",
    "region",
    "district",
    "address",
    "rooms",
    "area"
  ]
};

function buildExtractionInstruction() {
  return [
    "A property owner is describing their own flat/house/room to list for rent or sale on Uychi, a real estate marketplace for Uzbekistan, by chatting with a Telegram bot.",
    "Extract the listing fields from their message(s) below into the given JSON schema.",
    "Only use what they actually said -- never invent a price, room count, area, or address that wasn't mentioned. If something genuinely required is missing or unclear, make your best reasonable reading of their words rather than guessing a number from nothing.",
    "The user may write in Uzbek, Russian, or a mix. Keep title/description in that same language."
  ].join("\n");
}

async function getFileDownloadUrl(fileId: string) {
  const file = await callTelegramApi<{ file_path?: string }>("getFile", { file_id: fileId });

  if (!file?.file_path) {
    return null;
  }

  return `${FILE_BASE}/${file.file_path}`;
}

async function downloadTelegramPhotoAsFile(fileId: string, index: number) {
  const url = await getFileDownloadUrl(fileId);

  if (!url) {
    return null;
  }

  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return new File([buffer], `telegram-${Date.now()}-${index}.jpg`, { type: "image/jpeg" });
}

function formatDraftSummary(parsed: ParsedListing) {
  const priceLine = `${parsed.price} ${parsed.currency}${parsed.listingType === "rent" ? (parsed.rentType === "daily" ? "/kun" : "/oy") : ""}`;

  return [
    `📋 ${parsed.title}`,
    "",
    parsed.description,
    "",
    `💰 ${priceLine}`,
    `🏠 ${parsed.propertyType} · ${parsed.rooms} xona · ${parsed.area} m²`,
    `📍 ${parsed.region}, ${parsed.district}`,
    parsed.phone ? `📞 ${parsed.phone}` : "📞 (keyingi qadamda so'raladi)"
  ].join("\n");
}

async function handleAddListingStart(chatId: number) {
  listingDraftByChat.set(chatId, { stage: "collecting", texts: [], photoFileIds: [] });

  await sendMessage(
    chatId,
    [
      "🏠 Uyingizni Uychi saytiga joylashtiramiz.",
      "",
      "1️⃣ Uyingiz haqida yozing: turi (kvartira/uy/xona), ijaraga/sotuvga, hudud/tuman, narxi, xonalar soni, maydoni (m²).",
      "2️⃣ Bir nechta surat yuboring.",
      "",
      `Hammasini yuborib bo'lgach, "${DONE_LABEL}" tugmasini bosing.`
    ].join("\n"),
    {
      reply_markup: {
        keyboard: [[DONE_LABEL, CANCEL_LABEL]],
        resize_keyboard: true
      }
    }
  );
}

async function cancelDraft(chatId: number) {
  listingDraftByChat.delete(chatId);
  await sendMessage(chatId, "Bekor qilindi.", { reply_markup: { remove_keyboard: true } });
}

async function finalizeCollection(chatId: number, draft: ListingDraft) {
  if (draft.texts.length === 0) {
    await sendMessage(chatId, "Hali uyingiz haqida yozmadingiz. Iltimos, tavsif yuboring.");
    return;
  }

  if (draft.photoFileIds.length === 0) {
    await sendMessage(chatId, "Kamida bitta surat yuboring, keyin qaytadan urinib ko'ring.");
    return;
  }

  await sendMessage(chatId, "⏳ Ma'lumotlar tahlil qilinmoqda...", { reply_markup: { remove_keyboard: true } });

  let parsed: ParsedListing;

  try {
    const raw = await runGeminiJson<Omit<ParsedListing, "rentType" | "phone"> & {
      rentType?: string;
      phone?: string;
    }>({
      systemInstruction: buildExtractionInstruction(),
      contents: [{ role: "user", parts: [{ text: draft.texts.join("\n\n") }] }],
      responseSchema: listingExtractionSchema
    });

    parsed = {
      ...raw,
      rentType: (raw.rentType as ParsedListing["rentType"]) ?? (raw.listingType === "rent" ? "monthly" : null),
      phone: raw.phone?.trim() || null
    };
  } catch (error) {
    console.error("Listing extraction failed:", error);
    await sendMessage(
      chatId,
      "Ma'lumotlarni tahlil qilib bo'lmadi. Iltimos, tavsifni biroz boshqacharoq yozib, qaytadan urinib ko'ring (/addlisting)."
    );
    listingDraftByChat.delete(chatId);
    return;
  }

  draft.parsed = parsed;

  if (!parsed.phone) {
    draft.stage = "awaiting_phone";
    await sendMessage(chatId, "Bog'lanish uchun telefon raqamingizni ulashing:", {
      reply_markup: {
        keyboard: [[{ text: SHARE_PHONE_LABEL, request_contact: true }], [CANCEL_LABEL]],
        resize_keyboard: true
      }
    });
    return;
  }

  await presentConfirmation(chatId, draft);
}

async function presentConfirmation(chatId: number, draft: ListingDraft) {
  if (!draft.parsed) {
    return;
  }

  draft.stage = "confirming";

  await sendMessage(chatId, formatDraftSummary(draft.parsed), {
    reply_markup: {
      keyboard: [[CONFIRM_LABEL], [CANCEL_LABEL]],
      resize_keyboard: true
    }
  });
}

async function submitDraft(chatId: number, draft: ListingDraft) {
  const parsed = draft.parsed;

  if (!parsed) {
    return;
  }

  const centroid = getDistrictCentroid(parsed.region, parsed.district);

  const candidate = {
    listingType: parsed.listingType,
    title: parsed.title,
    description: parsed.description,
    price: parsed.price,
    currency: parsed.currency,
    region: parsed.region,
    district: parsed.district,
    city: "",
    address: parsed.address,
    rooms: parsed.rooms,
    area: parsed.area,
    propertyType: parsed.propertyType,
    rentType: parsed.rentType ?? "",
    latitude: centroid?.lat ?? 0,
    longitude: centroid?.lng ?? 0,
    phone: parsed.phone ?? "",
    telegramUsername: "",
    // Passes isValidListingImageValue's format check (must start with
    // "/uploads/" or be a real http(s) URL) purely to satisfy the schema's
    // min(1) requirement here -- never written to the DB, the real
    // uploaded paths below replace it entirely.
    images: ["/uploads/pending.jpg"]
  };

  const validated = listingInputSchema.safeParse(candidate);

  if (!validated.success) {
    console.error("Bot-submitted listing failed validation:", validated.error.flatten());
    await sendMessage(
      chatId,
      "Ma'lumotlarda xatolik bor edi, afsuski. Iltimos, qaytadan urinib ko'ring: /addlisting",
      { reply_markup: { remove_keyboard: true } }
    );
    listingDraftByChat.delete(chatId);
    return;
  }

  const uploadedImages: string[] = [];

  for (const [index, fileId] of draft.photoFileIds.entries()) {
    const file = await downloadTelegramPhotoAsFile(fileId, index);

    if (!file) {
      continue;
    }

    try {
      uploadedImages.push(await saveUploadedImageLocally(file));
    } catch (error) {
      console.error("Failed to save a Telegram-submitted photo:", error);
    }
  }

  if (uploadedImages.length === 0) {
    await sendMessage(chatId, "Suratlarni saqlab bo'lmadi. Iltimos, qaytadan urinib ko'ring: /addlisting", {
      reply_markup: { remove_keyboard: true }
    });
    listingDraftByChat.delete(chatId);
    return;
  }

  const listingId = randomUUID();
  const { rentType, latitude, longitude } = validated.data;
  const rentTypeSql = rentType ? Prisma.sql`CAST(${rentType} AS "RentType")` : Prisma.sql`NULL`;

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "Listing" (
        "id", "title", "description", "price", "listingType", "currency",
        "region", "district", "city", "address", "rooms", "area",
        "propertyType", "rentType", "latitude", "longitude", "locationPrecision",
        "phone", "status", "createdAt", "updatedAt", "userId"
      )
      VALUES (
        ${listingId}, ${validated.data.title}, ${validated.data.description}, ${validated.data.price},
        ${validated.data.listingType}, CAST(${validated.data.currency} AS "Currency"),
        ${validated.data.region}, ${validated.data.district}, ${validated.data.city},
        ${validated.data.address}, ${validated.data.rooms}, ${validated.data.area},
        CAST(${validated.data.propertyType} AS "PropertyType"), ${rentTypeSql},
        ${latitude}, ${longitude}, CAST('APPROXIMATE' AS "LocationPrecision"),
        ${validated.data.phone}, CAST(${ListingStatus.PENDING} AS "ListingStatus"),
        ${new Date()}, ${new Date()}, NULL
      )
    `
  );

  for (const url of uploadedImages) {
    await prisma.$executeRaw`
      INSERT INTO "ListingImage" ("id", "url", "listingId")
      VALUES (${randomUUID()}, ${url}, ${listingId})
    `;
  }

  listingDraftByChat.delete(chatId);

  await sendMessage(
    chatId,
    "✅ Rahmat! E'loningiz yuborildi va ko'rib chiqilmoqda. Tasdiqlangach, saytda ko'rinadi.",
    { reply_markup: { remove_keyboard: true } }
  );

  await notifyOwnerOfTelegramListing(validated.data.title);
}

/** Mirrors notifyOwnerOfNewListing in app/api/listings/route.ts -- same best-effort, silent-skip behavior if the owner hasn't linked Telegram. */
async function notifyOwnerOfTelegramListing(title: string) {
  try {
    const ownerEmail = getOwnerEmail();

    if (!ownerEmail) {
      return;
    }

    const owner = await getUserByEmail(ownerEmail);

    if (!owner?.telegramChatId) {
      return;
    }

    const link = getAbsoluteUrl(getOwnerDashboardPath());
    const text = [`🆕 Telegram bot orqali yangi e'lon`, title, "", link].join("\n");

    await sendTelegramNotification(owner.telegramChatId, text);
  } catch (error) {
    console.error("Owner notify (bot listing) failed:", error);
  }
}

async function handleListingDraftMessage(chatId: number, message: TelegramMessage, draft: ListingDraft) {
  if (message.text === CANCEL_LABEL) {
    await cancelDraft(chatId);
    return;
  }

  if (draft.stage === "collecting") {
    if (message.text === DONE_LABEL) {
      await finalizeCollection(chatId, draft);
      return;
    }

    if (message.text) {
      draft.texts.push(message.text);
    }

    if (message.photo && message.photo.length > 0) {
      draft.photoFileIds.push(message.photo[message.photo.length - 1].file_id);
    }

    return;
  }

  if (draft.stage === "awaiting_phone") {
    if (message.contact?.phone_number) {
      const phone = message.contact.phone_number.startsWith("+")
        ? message.contact.phone_number
        : `+${message.contact.phone_number}`;

      if (draft.parsed) {
        draft.parsed.phone = phone;
      }

      await presentConfirmation(chatId, draft);
    }

    return;
  }

  if (draft.stage === "confirming") {
    if (message.text === CONFIRM_LABEL) {
      await submitDraft(chatId, draft);
    }
  }
}

// -----------------------------------------------------------------------

async function handleUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message) {
    return;
  }

  const chatId = message.chat.id;
  const text = message.text?.trim();

  if (text?.startsWith("/start")) {
    const token = text.split(/\s+/)[1];
    await handleStart(chatId, token);
    return;
  }

  if (text === "/parol" || text === "/login" || text === NEW_PASSWORD_BUTTON) {
    listingDraftByChat.delete(chatId);
    pendingByChat.set(chatId, { kind: "direct_credentials", forceNewPassword: true });
    await sendMessage(
      chatId,
      "🔑 Yangi Login va Parol olish uchun quyidagi «📱 Telefon raqamimni ulashish» tugmasini bosing:",
      {
        reply_markup: {
          keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
    return;
  }

  if (text === "/addlisting" || text === ADD_LISTING_BUTTON) {
    pendingByChat.delete(chatId);
    await handleAddListingStart(chatId);
    return;
  }

  const activeDraft = listingDraftByChat.get(chatId);
  if (activeDraft) {
    await handleListingDraftMessage(chatId, message, activeDraft);
    return;
  }

  if (message.contact) {
    await handleContact(chatId, message, message.contact);
    return;
  }

  await handleStart(chatId);
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
