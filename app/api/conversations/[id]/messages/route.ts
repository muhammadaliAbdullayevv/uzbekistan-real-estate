import { NextResponse } from "next/server";

import {
  getConversationForUser,
  getMessages,
  markMessagesRead,
  sendMessage
} from "@/lib/conversations";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getApprovedListingById } from "@/lib/listings";
import { getAbsoluteUrl } from "@/lib/site";
import { sendTelegramNotification } from "@/lib/telegram-notify";
import { getUserProfileById } from "@/lib/user-data";
import { getUserSession } from "@/lib/user-session";
import { chatMessageSchema } from "@/lib/validations/chat";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: RouteContext) {
  const t = getTranslations(getLocale());
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: t.api.loginRequired }, { status: 401 });
  }

  const conversation = await getConversationForUser(params.id, session.userId);

  if (!conversation) {
    return NextResponse.json({ error: t.chat.notFound }, { status: 404 });
  }

  await markMessagesRead(conversation.id, session.userId);
  const messages = await getMessages(conversation.id);

  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: RouteContext) {
  const t = getTranslations(getLocale());
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: t.api.loginRequired }, { status: 401 });
  }

  const conversation = await getConversationForUser(params.id, session.userId);

  if (!conversation) {
    return NextResponse.json({ error: t.chat.notFound }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: t.chat.messageEmpty }, { status: 400 });
  }

  const message = await sendMessage({
    conversationId: conversation.id,
    senderId: session.userId,
    body: parsed.data.body
  });

  const recipientId =
    conversation.buyerId === session.userId ? conversation.ownerId : conversation.buyerId;

  notifyRecipient({
    recipientId,
    senderName: session.name,
    conversationId: conversation.id,
    listingId: conversation.listingId,
    body: parsed.data.body
  }).catch((error) => {
    console.error("Chat Telegram notification failed:", error);
  });

  return NextResponse.json({ message });
}

async function notifyRecipient(input: {
  recipientId: string;
  senderName: string | null;
  conversationId: string;
  listingId: string;
  body: string;
}) {
  const recipient = await getUserProfileById(input.recipientId);

  if (!recipient?.telegramChatId) {
    return;
  }

  const listing = await getApprovedListingById(input.listingId);
  const senderLabel = input.senderName?.trim() || "Foydalanuvchi";
  const listingLabel = listing?.title ?? "";
  const preview = input.body.length > 200 ? `${input.body.slice(0, 200)}…` : input.body;
  const link = getAbsoluteUrl(`/chat/${input.conversationId}`);

  const text = [
    `💬 ${senderLabel}dan yangi xabar`,
    listingLabel ? `E'lon: ${listingLabel}` : null,
    "",
    preview,
    "",
    link
  ]
    .filter((line) => line !== null)
    .join("\n");

  await sendTelegramNotification(recipient.telegramChatId, text);
}
