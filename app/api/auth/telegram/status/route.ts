import { NextResponse } from "next/server";

import { getTelegramLoginAttemptStatus } from "@/lib/telegram-verification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() ?? "";

  if (!token || token.length < 20) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  try {
    const result = await getTelegramLoginAttemptStatus(token);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to check Telegram login status:", error);
    return NextResponse.json({ status: "invalid" }, { status: 500 });
  }
}
