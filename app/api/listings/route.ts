import { randomUUID } from "node:crypto";

import { ListingStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getAbsoluteUrl } from "@/lib/site";
import { getOwnerDashboardPath, getOwnerEmail } from "@/lib/owner";
import { sendTelegramNotification } from "@/lib/telegram-notify";
import { getUserByEmail } from "@/lib/user-data";
import { getUserSession } from "@/lib/user-session";
import { listingInputSchema } from "@/lib/validations/listing";

/**
 * Best-effort: the owner moderates every listing alone, so let them know a
 * new one is waiting instead of relying on them checking the dashboard.
 * No-ops silently if OWNER_EMAIL's account hasn't verified its phone via
 * Telegram yet (same as any other user without a telegramChatId).
 */
async function notifyOwnerOfNewListing(listing: { title: string }) {
  const ownerEmail = getOwnerEmail();

  if (!ownerEmail) {
    return;
  }

  const owner = await getUserByEmail(ownerEmail);

  if (!owner?.telegramChatId) {
    return;
  }

  const link = getAbsoluteUrl(getOwnerDashboardPath());
  const text = [`🆕 Yangi e'lon ko'rib chiqishni kutmoqda`, listing.title, "", link].join("\n");

  await sendTelegramNotification(owner.telegramChatId, text);
}

export async function POST(request: Request) {
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

    const { images, ...listingData } = parsed.data;
    const listingId = randomUUID();
    const rentTypeSql = listingData.rentType
      ? Prisma.sql`CAST(${listingData.rentType} AS "RentType")`
      : Prisma.sql`NULL`;

    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "Listing" (
          "id",
          "title",
          "description",
          "price",
          "listingType",
          "currency",
          "region",
          "district",
          "city",
          "address",
          "rooms",
          "area",
          "propertyType",
          "rentType",
          "latitude",
          "longitude",
          "locationPrecision",
          "phone",
          "status",
          "createdAt",
          "updatedAt",
          "userId"
        )
        VALUES (
          ${listingId},
          ${listingData.title},
          ${listingData.description},
          ${listingData.price},
          ${listingData.listingType},
          CAST(${listingData.currency} AS "Currency"),
          ${listingData.region},
          ${listingData.district},
          ${listingData.city},
          ${listingData.address},
          ${listingData.rooms},
          ${listingData.area},
          CAST(${listingData.propertyType} AS "PropertyType"),
          ${rentTypeSql},
          ${listingData.latitude},
          ${listingData.longitude},
          CAST('EXACT' AS "LocationPrecision"),
          ${listingData.phone},
          CAST(${ListingStatus.PENDING} AS "ListingStatus"),
          ${new Date()},
          ${new Date()},
          ${session.userId}
        )
      `
    );

    for (const url of images) {
      await prisma.$executeRaw`
        INSERT INTO "ListingImage" ("id", "url", "listingId")
        VALUES (${randomUUID()}, ${url}, ${listingId})
      `;
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/account");
    revalidatePath("/my-listings");

    notifyOwnerOfNewListing({ title: listingData.title }).catch((notifyError) => {
      console.error("Owner notify failed:", notifyError);
    });

    return NextResponse.json(
      {
        id: listingId,
        message: t.api.listingSubmitted
      },
      {
        status: 201
      }
    );
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
