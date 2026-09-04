import { NextResponse } from "next/server";

import {
  AI_UYCHI_MAX_MESSAGES_PER_HOUR,
  aiUychiTools,
  buildSystemInstruction
} from "@/lib/ai-uychi";
import { isAiRateLimited } from "@/lib/ai-rate-limit";
import { hasGeminiConfig, runGeminiConversation, type GeminiContent } from "@/lib/gemini";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getApprovedListingById } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

type IncomingMessage = { role: "user" | "model"; text: string };

export async function POST(request: Request) {
  const locale = getLocale();
  const t = getTranslations(locale);

  if (!hasGeminiConfig()) {
    return NextResponse.json({ error: t.aiUychi.notConfigured }, { status: 503 });
  }

  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: t.api.loginRequired }, { status: 401 });
  }

  if (isAiRateLimited(session.userId, AI_UYCHI_MAX_MESSAGES_PER_HOUR)) {
    return NextResponse.json({ error: t.aiUychi.rateLimited }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const rawMessages = Array.isArray(body?.messages) ? (body.messages as IncomingMessage[]) : null;

  if (!rawMessages || rawMessages.length === 0) {
    return NextResponse.json({ error: t.aiUychi.messageEmpty }, { status: 400 });
  }

  const messages = rawMessages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string")
    .map((m) => ({ role: m.role, text: m.text.trim().slice(0, MAX_MESSAGE_LENGTH) }))
    .filter((m) => m.text.length > 0);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: t.aiUychi.messageEmpty }, { status: 400 });
  }

  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  try {
    const result = await runGeminiConversation({
      systemInstruction: buildSystemInstruction(locale),
      contents,
      tools: aiUychiTools
    });

    const listings = (
      await Promise.all(result.listingIds.map((id) => getApprovedListingById(id)))
    ).filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));

    return NextResponse.json({
      text: result.text || t.aiUychi.emptyResponse,
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        listingType: listing.listingType,
        rentType: listing.rentType,
        district: listing.district,
        region: listing.region,
        rooms: listing.rooms,
        area: listing.area,
        image: listing.images[0]?.url ?? null
      }))
    });
  } catch (error) {
    console.error("AI Uychi error:", error);
    return NextResponse.json({ error: t.aiUychi.unableToRespond }, { status: 500 });
  }
}
