import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { redirectUrl } from "@/lib/site";
import { dismissPreferencesPrompt } from "@/lib/user-data";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.redirect(redirectUrl("/login?next=/account"), { status: 303 });
  }

  await dismissPreferencesPrompt(session.userId);

  revalidatePath("/account");

  return NextResponse.redirect(redirectUrl("/account"), { status: 303 });
}
