import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { toUserSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVisitorId, mergeFavoritesIntoUser } from "@/lib/favorites";
import { hashPassword } from "@/lib/password";
import {
  generateMemorablePassword,
  validateTelegramWebAppData
} from "@/lib/telegram-verification";
import {
  getUserByTelegramChatId,
  getUserByTelegramUsername,
  getUserProfileById
} from "@/lib/user-data";
import {
  createUserSession,
  setUserSessionCookie
} from "@/lib/user-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 });
    }

    const body = (await request.json()) as { initData?: string };
    const initData = body.initData?.trim() ?? "";

    if (!initData) {
      return NextResponse.json({ ok: false, error: "Missing initData" }, { status: 400 });
    }

    const { valid, user: tgUser } = validateTelegramWebAppData(initData, botToken);
    if (!valid || !tgUser?.id) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }

    const tgChatId = String(tgUser.id);
    let user = await getUserByTelegramChatId(tgChatId);

    if (!user && tgUser.username) {
      user = await getUserByTelegramUsername(tgUser.username);
      if (user) {
        await prisma.$executeRaw`
          UPDATE "User"
          SET "telegramChatId" = ${tgChatId}, "updatedAt" = NOW()
          WHERE "id" = ${user.id}
        `;
      }
    }

    if (!user) {
      const id = randomUUID();
      const now = new Date();
      const syntheticEmail = `${tgChatId}@tg.uychi.site`;
      const displayName =
        [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ").trim() ||
        "Telegram Foydalanuvchisi";
      const plainPass = generateMemorablePassword();
      const passwordHash = await hashPassword(plainPass);
      const cleanUsername = tgUser.username?.replace(/^@+/, "").trim() || null;

      await prisma.$executeRaw`
        INSERT INTO "User" (
          "id",
          "email",
          "name",
          "passwordHash",
          "plainPass",
          "telegramUsername",
          "telegramChatId",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${id},
          ${syntheticEmail},
          ${displayName},
          ${passwordHash},
          ${plainPass},
          ${cleanUsername},
          ${tgChatId},
          ${now},
          ${now}
        )
      `;

      user = await getUserProfileById(id);
    }

    if (!user) {
      return NextResponse.json({ ok: false, error: "Failed to resolve user" }, { status: 500 });
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json({ ok: false, error: "blocked" }, { status: 403 });
    }

    await mergeFavoritesIntoUser(getVisitorId(), user.id);

    const sessionPayload = toUserSession(user);
    const sessionToken = await createUserSession(sessionPayload);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        telegramUsername: user.telegramUsername
      }
    });

    setUserSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Telegram WebApp validation error:", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
