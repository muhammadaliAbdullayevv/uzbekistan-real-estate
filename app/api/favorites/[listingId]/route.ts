import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getLocale, getTranslations } from "@/lib/i18n";
import { addFavoriteListing, removeFavoriteListing } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

type RouteContext = {
  params: {
    listingId: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  const t = getTranslations(getLocale());
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json(
      {
        error: t.api.loginRequired
      },
      {
        status: 401
      }
    );
  }

  const saved = await addFavoriteListing(session.userId, params.listingId);

  if (!saved) {
    return NextResponse.json(
      {
        error: t.listingDetail.listingNotFound
      },
      {
        status: 404
      }
    );
  }

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/favorites");
  revalidatePath(`/listings/${params.listingId}`);

  return NextResponse.json({
    saved
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const t = getTranslations(getLocale());
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json(
      {
        error: t.api.loginRequired
      },
      {
        status: 401
      }
    );
  }

  await removeFavoriteListing(session.userId, params.listingId);

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/favorites");
  revalidatePath(`/listings/${params.listingId}`);

  return NextResponse.json({
    saved: false
  });
}
