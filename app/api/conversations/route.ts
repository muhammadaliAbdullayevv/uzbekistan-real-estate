import { NextResponse } from "next/server";

import { getOrCreateConversation } from "@/lib/conversations";
import { getApprovedListingById } from "@/lib/listings";
import { redirectUrl } from "@/lib/site";
import { getUserSession } from "@/lib/user-session";

export async function POST(request: Request) {
  const session = await getUserSession();
  const formData = await request.formData();
  const listingId = formData.get("listingId");

  if (typeof listingId !== "string" || !listingId) {
    return NextResponse.redirect(redirectUrl("/"), { status: 303 });
  }

  if (!session) {
    return NextResponse.redirect(
      redirectUrl(`/login?next=${encodeURIComponent(`/listings/${listingId}#contact-panel`)}`),
      { status: 303 }
    );
  }

  const listing = await getApprovedListingById(listingId);

  if (!listing || !listing.userId || listing.userId === session.userId) {
    return NextResponse.redirect(redirectUrl(`/listings/${listingId}`), { status: 303 });
  }

  const conversationId = await getOrCreateConversation({
    listingId: listing.id,
    buyerId: session.userId,
    ownerId: listing.userId
  });

  return NextResponse.redirect(redirectUrl(`/chat/${conversationId}`), { status: 303 });
}
