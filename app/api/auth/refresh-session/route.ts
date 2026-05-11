import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
  USER_SESSION_TTL_SECONDS,
  getUserSession
} from "@/lib/user-session";

/**
 * GET /api/auth/refresh-session
 *
 * Called by the client-side SessionRefresher component on every page mount.
 * Reads the current session cookie, validates it (which also refreshes the DB
 * expiresAt via sliding window in getStoredUserSession), then resets the
 * cookie maxAge so the browser deadline is also extended.
 */
export async function GET() {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = cookies().get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  // Refresh the browser cookie maxAge to match the extended DB expiry.
  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_SESSION_TTL_SECONDS
  });

  return response;
}
