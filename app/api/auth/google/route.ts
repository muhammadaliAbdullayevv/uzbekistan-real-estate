import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getGoogleAuthUrl, hasGoogleAuthConfig } from "@/lib/google-auth";
import { getSafeUserNextPath } from "@/lib/user-session";

const STATE_COOKIE = "__google_oauth_state";
const NEXT_COOKIE = "__google_oauth_next";
const OAUTH_COOKIE_MAX_AGE = 600; // 10 minutes

export async function GET(request: Request) {
  if (!hasGoogleAuthConfig()) {
    return NextResponse.redirect(new URL("/login?error=google", request.url), { status: 303 });
  }

  const url = new URL(request.url);
  const nextPath = getSafeUserNextPath(url.searchParams.get("next"));
  const state = randomBytes(24).toString("hex");

  const response = NextResponse.redirect(getGoogleAuthUrl(state), { status: 303 });

  response.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE
  });

  response.cookies.set({
    name: NEXT_COOKIE,
    value: nextPath,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE
  });

  return response;
}
