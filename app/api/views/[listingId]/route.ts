import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getLocale, getTranslations } from "@/lib/i18n";
import { trackListingView } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

type RouteContext = {
  params: {
    listingId: string;
  };
};

export async function POST(_request: Request, { params }: RouteContext) {
  const t = getTranslations(getLocale());
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({
      tracked: false
    });
  }

  const listing = await prisma.listing.findFirst({
    where: {
      id: params.listingId,
      status: "APPROVED"
    },
    select: {
      id: true
    }
  });

  if (!listing) {
    return NextResponse.json(
      {
        error: t.listingDetail.listingNotFound
      },
      {
        status: 404
      }
    );
  }

  await trackListingView(session.userId, listing.id);

  return NextResponse.json({
    tracked: true
  });
}
