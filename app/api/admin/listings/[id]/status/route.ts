import { ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getPublicAdminPath } from "@/lib/admin-path";
import { prisma } from "@/lib/db";
import { getOwnerLoginPath, isOwner } from "@/lib/owner";
import { redirectUrl } from "@/lib/site";
import { notifySubmitterOfRejection } from "@/lib/telegram-notify";
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
    return NextResponse.redirect(redirectUrl(getOwnerLoginPath()), { status: 303 });
  }

  if (!isOwner(session)) {
    return NextResponse.redirect(redirectUrl("/account"), { status: 303 });
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

  const updated = await prisma.listing.update({
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

  if (updated.status === ListingStatus.REJECTED) {
    notifySubmitterOfRejection({ title: updated.title, userId: updated.userId }).catch(
      (notifyError) => {
        console.error("Rejection notify failed:", notifyError);
      }
    );
  }

  return NextResponse.redirect(redirectUrl(ownerDashboardPath), { status: 303 });
}
