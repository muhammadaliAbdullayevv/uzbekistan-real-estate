import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { LISTING_TYPES, type ListingTypeValue } from "@/lib/constants";

export const PREFERRED_LISTING_TYPE_COOKIE = "__pref_listing_type";

export function normalizePreferredListingType(
  value?: string | null
): ListingTypeValue | null {
  return LISTING_TYPES.includes(value as ListingTypeValue)
    ? (value as ListingTypeValue)
    : null;
}

export function getPreferredListingType() {
  return normalizePreferredListingType(
    cookies().get(PREFERRED_LISTING_TYPE_COOKIE)?.value
  );
}

export function setPreferredListingTypeCookie(
  response: NextResponse,
  value?: string | null
) {
  const normalized = normalizePreferredListingType(value);

  if (!normalized) {
    response.cookies.set({
      name: PREFERRED_LISTING_TYPE_COOKIE,
      value: "",
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
    return;
  }

  response.cookies.set({
    name: PREFERRED_LISTING_TYPE_COOKIE,
    value: normalized,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}
