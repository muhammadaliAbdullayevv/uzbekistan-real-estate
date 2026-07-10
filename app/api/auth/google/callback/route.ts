import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { authenticateWithGoogle } from "@/lib/auth";
import { exchangeGoogleCode } from "@/lib/google-auth";
import { resolvePostAuthPath } from "@/lib/owner";
import {
  createUserSession,
  getSafeUserNextPath,
  setUserSessionCookie
} from "@/lib/user-session";

const STATE_COOKIE = "__google_oauth_state";
const NEXT_COOKIE = "__google_oauth_next";

function clearOauthCookies(response: NextResponse) {
  response.cookies.set({ name: STATE_COOKIE, value: "", path: "/", maxAge: 0 });
  response.cookies.set({ name: NEXT_COOKIE, value: "", path: "/", maxAge: 0 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookieStore = cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const nextPath = getSafeUserNextPath(cookieStore.get(NEXT_COOKIE)?.value);

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    const response = NextResponse.redirect(new URL("/login?error=google", request.url), {
      status: 303
    });
    clearOauthCookies(response);
    return response;
  }

  try {
    const profile = await exchangeGoogleCode(code);
    const result = await authenticateWithGoogle(profile);

    if (!result.user) {
      const response = NextResponse.redirect(
        new URL(`/login?error=${result.error}`, request.url),
        { status: 303 }
      );
      clearOauthCookies(response);
      return response;
    }

    const token = await createUserSession(result.user);
    const destination = resolvePostAuthPath(result.user, nextPath);
    const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 });

    setUserSessionCookie(response, token);
    clearOauthCookies(response);

    return response;
  } catch (error) {
    console.error("Google sign-in failed:", error);
    const response = NextResponse.redirect(new URL("/login?error=google", request.url), {
      status: 303
    });
    clearOauthCookies(response);
    return response;
  }
}
