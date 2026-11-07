import { NextResponse } from "next/server";

import { toUserSession } from "@/lib/auth";
import { getVisitorId, mergeFavoritesIntoUser } from "@/lib/favorites";
import { resolvePostAuthPath } from "@/lib/owner";
import { consumeTelegramLoginAttempt } from "@/lib/telegram-verification";
import { getUserProfileById } from "@/lib/user-data";
import {
  createUserSession,
  getSafeUserNextPath,
  setUserSessionCookie
} from "@/lib/user-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; next?: string };
    const token = body.token?.trim() ?? "";
    const safeNext = getSafeUserNextPath(body.next ?? "/account");

    if (!token) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const consumed = await consumeTelegramLoginAttempt(token);
    if (!consumed) {
      return NextResponse.json({ ok: false, error: "expired" }, { status: 400 });
    }

    const user = await getUserProfileById(consumed.userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json({ ok: false, error: "blocked" }, { status: 403 });
    }

    await mergeFavoritesIntoUser(getVisitorId(), user.id);

    const sessionPayload = toUserSession(user);
    const sessionToken = await createUserSession(sessionPayload);
    const redirectTo = resolvePostAuthPath(sessionPayload, safeNext);

    const response = NextResponse.json({
      ok: true,
      redirectTo,
      plainPass: consumed.plainPass,
      phone: user.phone,
      name: user.name
    });

    setUserSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Failed to complete Telegram login:", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
