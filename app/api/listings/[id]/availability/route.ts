import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getLocale, getTranslations } from "@/lib/i18n";
import {
  getListingForUserById,
  updateListingAvailabilityForUser
} from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";
import { listingAvailabilitySchema } from "@/lib/validations/listing";

function revalidateListingPaths(id: string) {
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/favorites");
  revalidatePath("/my-listings");
  revalidatePath(`/my-listings/${id}/edit`);
  revalidatePath(`/listings/${id}`);
  revalidatePath("/admin");
}

type ListingAvailabilityRouteProps = {
  params: {
    id: string;
  };
};

export async function PATCH(
  request: Request,
  { params }: ListingAvailabilityRouteProps
) {
  try {
    const locale = getLocale();
    const t = getTranslations(locale);
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        {
          error: t.api.loginToSubmitListing
        },
        {
          status: 401
        }
      );
    }

    const body = await request.json();
    const parsed = listingAvailabilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: t.api.invalidListingPayload
        },
        {
          status: 400
        }
      );
    }

    const listing = await getListingForUserById(session.userId, params.id);

    if (!listing) {
      return NextResponse.json(
        {
          error: "Listing not found."
        },
        {
          status: 404
        }
      );
    }

    if (
      parsed.data.availabilityStatus === "RENTED" &&
      listing.listingType !== "rent"
    ) {
      return NextResponse.json(
        {
          error: "Only rental listings can be marked as rented."
        },
        {
          status: 400
        }
      );
    }

    if (
      parsed.data.availabilityStatus === "SOLD" &&
      listing.listingType !== "sale"
    ) {
      return NextResponse.json(
        {
          error: "Only sale listings can be marked as sold."
        },
        {
          status: 400
        }
      );
    }

    const updated = await updateListingAvailabilityForUser(
      session.userId,
      params.id,
      parsed.data.availabilityStatus
    );

    if (!updated) {
      return NextResponse.json(
        {
          error: "Listing not found."
        },
        {
          status: 404
        }
      );
    }

    revalidateListingPaths(params.id);

    return NextResponse.json({
      id: updated.id,
      availabilityStatus: updated.availabilityStatus
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to update listing availability."
      },
      {
        status: 500
      }
    );
  }
}
