import { NextResponse } from "next/server";

import { toUserSession } from "@/lib/auth";
import { getVisitorId, mergeFavoritesIntoUser } from "@/lib/favorites";
import { resolvePostAuthPath } from "@/lib/owner";
import { redirectUrl } from "@/lib/site";
import { consumeTelegramLoginAttempt } from "@/lib/telegram-verification";
import { getUserProfileById } from "@/lib/user-data";
import {
  createUserSession,
  getSafeUserNextPath,
  setUserSessionCookie
} from "@/lib/user-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("t")?.trim() ?? "";
    const safeNext = getSafeUserNextPath(searchParams.get("next") ?? "/account");

    if (!token) {
      return NextResponse.redirect(redirectUrl("/login"));
    }

    const consumed = await consumeTelegramLoginAttempt(token);
    if (!consumed) {
      return NextResponse.redirect(redirectUrl("/login?error=expired"));
    }

    const user = await getUserProfileById(consumed.userId);
    if (!user || user.status === "BLOCKED") {
      return NextResponse.redirect(
        redirectUrl(`/login?error=${user?.status === "BLOCKED" ? "blocked" : "invalid"}`)
      );
    }

    await mergeFavoritesIntoUser(getVisitorId(), user.id);

    const sessionPayload = toUserSession(user);
    const sessionToken = await createUserSession(sessionPayload);
    const redirectTo = resolvePostAuthPath(sessionPayload, safeNext);

    const response = NextResponse.redirect(redirectUrl(redirectTo), { status: 303 });
    setUserSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Direct Telegram login failed:", error);
    return NextResponse.redirect(redirectUrl("/login?error=invalid"));
  }
}
