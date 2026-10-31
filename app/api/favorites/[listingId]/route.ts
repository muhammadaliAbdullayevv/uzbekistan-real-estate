import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getLocale, getTranslations } from "@/lib/i18n";
import {
  addFavorite,
  getVisitorId,
  removeFavorite,
  setVisitorIdCookie
} from "@/lib/favorites";
import { getUserSession } from "@/lib/user-session";

type RouteContext = {
  params: {
    listingId: string;
  };
};

function revalidateFavoritePages(listingId: string) {
  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/account");
  revalidatePath(`/listings/${listingId}`);
}

export async function POST(_request: Request, { params }: RouteContext) {
  const t = getTranslations(getLocale());
  const session = await getUserSession();
  const existingVisitorId = getVisitorId();
  const visitorId = existingVisitorId ?? randomUUID();

  const saved = await addFavorite({
    visitorId,
    userId: session?.userId ?? null,
    listingId: params.listingId
  });

  if (!saved) {
    return NextResponse.json(
      { error: t.listingDetail.listingNotFound },
      { status: 404 }
    );
  }

  revalidateFavoritePages(params.listingId);

  const response = NextResponse.json({ saved: true });
  if (!existingVisitorId) {
    setVisitorIdCookie(response, visitorId);
  }
  return response;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getUserSession();
  const visitorId = getVisitorId();

  await removeFavorite({
    visitorId,
    userId: session?.userId ?? null,
    listingId: params.listingId
  });

  revalidateFavoritePages(params.listingId);

  return NextResponse.json({ saved: false });
}
