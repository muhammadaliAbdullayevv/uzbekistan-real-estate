import { NextResponse } from "next/server";

import { redirectUrl } from "@/lib/site";
import { createTelegramVerifyRedirect } from "@/lib/telegram-verification";
import { getUserSession } from "@/lib/user-session";

export async function POST() {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.redirect(redirectUrl("/login?next=/account"), { status: 303 });
  }

  const result = await createTelegramVerifyRedirect(session.userId);

  if (!result.ok) {
    return NextResponse.redirect(redirectUrl(`/account?telegramError=${result.errorCode}`), {
      status: 303
    });
  }

  return NextResponse.redirect(result.url, { status: 303 });
}
