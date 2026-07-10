import { NextResponse } from "next/server";

import { markEmailVerified } from "@/lib/user-data";
import { consumeUserToken } from "@/lib/user-tokens";
import { getUserSession } from "@/lib/user-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  const userId = token ? await consumeUserToken(token, "VERIFY_EMAIL") : null;

  if (!userId) {
    return NextResponse.redirect(new URL("/login?error=verify-invalid", request.url), {
      status: 303
    });
  }

  await markEmailVerified(userId);

  const session = await getUserSession();
  const destination = session ? "/account?notice=email-verified" : "/login?notice=email-verified";

  return NextResponse.redirect(new URL(destination, request.url), { status: 303 });
}
