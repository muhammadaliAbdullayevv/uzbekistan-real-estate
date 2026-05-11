import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getLocale, getTranslations } from "@/lib/i18n";
import { deleteListingForUser, updateListingForUser } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";
import { listingInputSchema } from "@/lib/validations/listing";

function revalidateListingPaths(id: string) {
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/favorites");
  revalidatePath("/my-listings");
  revalidatePath(`/my-listings/${id}/edit`);
  revalidatePath(`/listings/${id}`);
  revalidatePath("/admin");
}

type ListingRouteProps = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: ListingRouteProps) {
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
    const parsed = listingInputSchema.safeParse(body);

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

    const updated = await updateListingForUser(session.userId, params.id, {
      ...parsed.data,
      rentType: parsed.data.rentType || null
    });

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
      id: updated.id
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: getTranslations(getLocale()).api.unableToSaveListing
      },
      {
        status: 500
      }
    );
  }
}

export async function DELETE(_request: Request, { params }: ListingRouteProps) {
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

    const deleted = await deleteListingForUser(session.userId, params.id);

    if (!deleted) {
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
      ok: true
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to delete listing."
      },
      {
        status: 500
      }
    );
  }
}
