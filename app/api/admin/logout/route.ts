import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getOwnerLoginPath } from "@/lib/owner";
import { redirectUrl } from "@/lib/site";
import {
  clearUserSessionCookie,
  deleteUserSession,
  USER_SESSION_COOKIE
} from "@/lib/user-session";

export async function POST() {
  await deleteUserSession(cookies().get(USER_SESSION_COOKIE)?.value);
  const response = NextResponse.redirect(redirectUrl(getOwnerLoginPath()), {
    status: 303
  });

  clearUserSessionCookie(response);

  return response;
}
