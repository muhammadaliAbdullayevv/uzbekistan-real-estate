import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  normalizePreferredListingType,
  setPreferredListingTypeCookie
} from "@/lib/account-preferences";
import { getUserSession } from "@/lib/user-session";
import { updateUserPreferences } from "@/lib/user-data";
import { redirectUrl } from "@/lib/site";
import { createTelegramVerifyRedirect } from "@/lib/telegram-verification";
import { userPreferenceSchema } from "@/lib/validations/listing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.redirect(redirectUrl("/login?next=/account"), { status: 303 });
  }

  const formData = await request.formData();
  const preferredListingType = normalizePreferredListingType(
    typeof formData.get("preferredListingType") === "string"
      ? (formData.get("preferredListingType") as string)
      : null
  );
  const parsed = userPreferenceSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    telegramUsername: formData.get("telegramUsername"),
    avatarUrl: formData.get("avatarUrl"),
    preferredRegion: formData.get("preferredRegion"),
    preferredDistrict: formData.get("preferredDistrict"),
    preferredPropertyType: formData.get("preferredPropertyType"),
    preferredRentType: formData.get("preferredRentType"),
    preferredMinPrice: formData.get("preferredMinPrice"),
    preferredMaxPrice: formData.get("preferredMaxPrice")
  });

  if (!parsed.success) {
    return NextResponse.redirect(redirectUrl("/account?updated=0"), { status: 303 });
  }

  const user = await updateUserPreferences(session.userId, parsed.data);

  if (!user) {
    return NextResponse.redirect(redirectUrl("/login?next=/account"), { status: 303 });
  }

  revalidatePath("/", "layout");
  revalidatePath("/account");

  const startTelegramVerify = formData.get("startTelegramVerify") === "1";

  if (startTelegramVerify) {
    const verifyResult = await createTelegramVerifyRedirect(session.userId);
    const redirectTarget = verifyResult.ok
      ? verifyResult.url
      : redirectUrl(`/account?telegramError=${verifyResult.errorCode}`);

    const response = NextResponse.redirect(redirectTarget, { status: 303 });
    setPreferredListingTypeCookie(response, preferredListingType);
    return response;
  }

  const response = NextResponse.redirect(redirectUrl("/account?updated=1"), {
    status: 303
  });

  setPreferredListingTypeCookie(response, preferredListingType);

  return response;
}
