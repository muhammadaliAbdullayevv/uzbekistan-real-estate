import { NextResponse } from "next/server";

import {
  createTelegramLoginAttempt,
  hasTelegramBotConfig
} from "@/lib/telegram-verification";

export async function POST() {
  try {
    if (!hasTelegramBotConfig()) {
      return NextResponse.json(
        { ok: false, error: "Telegram bot is not configured." },
        { status: 503 }
      );
    }

    const attempt = await createTelegramLoginAttempt(20);

    return NextResponse.json({
      ok: true,
      token: attempt.token,
      botUrl: attempt.botUrl,
      expiresAt: attempt.expiresAt.toISOString()
    });
  } catch (error) {
    console.error("Failed to start Telegram login attempt:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to start Telegram login." },
      { status: 500 }
    );
  }
}
