import { ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getPublicAdminPath } from "@/lib/admin-path";
import { prisma } from "@/lib/db";
import { getOwnerLoginPath, isOwner } from "@/lib/owner";
import { getUserSession } from "@/lib/user-session";
import { listingStatusSchema } from "@/lib/validations/listing";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getUserSession();
  const ownerDashboardPath = getPublicAdminPath();

  if (!session) {
    return NextResponse.redirect(new URL(getOwnerLoginPath(), request.url), { status: 303 });
  }

  if (!isOwner(session)) {
    return NextResponse.redirect(new URL("/account", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const parsed = listingStatusSchema.safeParse({
    status: formData.get("status")
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid status."
      },
      {
        status: 400
      }
    );
  }

  await prisma.listing.update({
    where: {
      id: params.id
    },
    data: {
      status: parsed.data.status as ListingStatus
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/listings/${params.id}`);

  return NextResponse.redirect(new URL(ownerDashboardPath, request.url), { status: 303 });
}
