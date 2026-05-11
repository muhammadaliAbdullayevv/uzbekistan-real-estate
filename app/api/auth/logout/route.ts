import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  clearUserSessionCookie,
  deleteUserSession,
  getSafeUserNextPath,
  USER_SESSION_COOKIE
} from "@/lib/user-session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const nextPath = getSafeUserNextPath(String(formData.get("next") ?? "/"));
  await deleteUserSession(cookies().get(USER_SESSION_COOKIE)?.value);
  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });

  clearUserSessionCookie(response);

  return response;
}
