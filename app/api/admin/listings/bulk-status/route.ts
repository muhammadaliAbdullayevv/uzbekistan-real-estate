import { ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { isOwner } from "@/lib/owner";
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
  const result = await prisma.listing.updateMany({
    where: { id: { in: ids }, status: ListingStatus.PENDING },
    data: { status: status as ListingStatus }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  for (const id of ids) {
    revalidatePath(`/listings/${id}`);
  }

  return NextResponse.json({ updated: result.count });
}
