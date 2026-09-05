import { ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/owner";
import { notifySubmitterOfRejection } from "@/lib/telegram-notify";
import { getUserSession } from "@/lib/user-session";

const bulkStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
  status: z.enum(["APPROVED", "REJECTED"])
});

export async function POST(request: Request) {
  const session = await getUserSession();

  if (!session || !isOwner(session)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { ids, status } = parsed.data;

  // Only touches listings that are still PENDING -- a listing already
  // approved/rejected by a concurrent action (e.g. a second tab) is left
  // alone rather than silently overwritten by a stale bulk selection.
  // Selected before updating (rather than updateMany alone) so the
  // rejected ones can each be passed to the notify helper below.
  const targets = await prisma.listing.findMany({
    where: { id: { in: ids }, status: ListingStatus.PENDING },
    select: { id: true, title: true, userId: true }
  });

  if (targets.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  await prisma.listing.updateMany({
    where: { id: { in: targets.map((listing) => listing.id) } },
    data: { status: status as ListingStatus }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  for (const listing of targets) {
    revalidatePath(`/listings/${listing.id}`);
  }

  if (status === "REJECTED") {
    for (const listing of targets) {
      notifySubmitterOfRejection({ title: listing.title, userId: listing.userId }).catch(
        (notifyError) => {
          console.error("Rejection notify failed:", notifyError);
        }
      );
    }
  }

  return NextResponse.json({ updated: targets.length });
}
