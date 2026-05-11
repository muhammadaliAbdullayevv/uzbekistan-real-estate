import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  normalizePreferredListingType,
  setPreferredListingTypeCookie
} from "@/lib/account-preferences";
import { getUserSession } from "@/lib/user-session";
import { updateUserPreferences } from "@/lib/user-data";
import { userPreferenceSchema } from "@/lib/validations/listing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login?next=/account", request.url), { status: 303 });
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
    preferredRegion: formData.get("preferredRegion"),
    preferredDistrict: formData.get("preferredDistrict"),
    preferredPropertyType: formData.get("preferredPropertyType"),
    preferredRentType: formData.get("preferredRentType"),
    preferredMinPrice: formData.get("preferredMinPrice"),
    preferredMaxPrice: formData.get("preferredMaxPrice")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/account?updated=0", request.url), { status: 303 });
  }

  const user = await updateUserPreferences(session.userId, parsed.data);

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/account", request.url), { status: 303 });
  }

  revalidatePath("/");
  revalidatePath("/account");

  const response = NextResponse.redirect(new URL("/account?updated=1", request.url), {
    status: 303
  });

  setPreferredListingTypeCookie(response, preferredListingType);

  return response;
}
