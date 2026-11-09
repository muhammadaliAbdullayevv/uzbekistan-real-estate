export { privatePageMetadata as metadata } from "@/lib/site";
import {
  SavedListingsView,
  type SavedListingItem
} from "@/components/saved-listings-view";
import { getVisitorId, getFavoriteListings } from "@/lib/favorites";
import {
  formatPrice,
  formatPriceEquiv,
  getTelegramLink
} from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const locale = getLocale();
  const t = getTranslations(locale);
  const isRu = locale === "ru";
  const session = await getUserSession();
  const visitorId = getVisitorId();

  const favorites = await getFavoriteListings(visitorId, session?.userId ?? null);

  const formattedItems: SavedListingItem[] = favorites.map((listing) => {
    const floorLabel =
      listing.propertyType === "house"
        ? [
            listing.plotArea ? `${listing.plotArea} ${isRu ? "сот." : "sotix"}` : null,
            listing.totalFloors ? `${listing.totalFloors} ${isRu ? "эт." : "qavat"}` : null
          ]
            .filter(Boolean)
            .join(" · ")
        : listing.floor && listing.totalFloors
          ? `${listing.floor}/${listing.totalFloors} ${isRu ? "эт." : "qavat"}`
          : listing.floor
            ? `${listing.floor}-${isRu ? "эт." : "qavat"}`
            : null;

    const priceFormatted = `${formatPrice(
      listing.price,
      listing.currency,
      listing.listingType,
      listing.rentType,
      locale
    )}${listing.listingType === "rent" ? (isRu ? " /мес" : " /oy") : ""}`;

    return {
      id: listing.id,
      title: listing.title,
      priceFormatted,
      priceEquivFormatted: formatPriceEquiv(listing.price, listing.currency, locale),
      priceRaw: listing.price,
      currency: listing.currency,
      listingType: listing.listingType as "rent" | "sale",
      rentType: listing.rentType as "monthly" | "daily" | null,
      region: listing.region,
      district: listing.district,
      rooms: listing.rooms,
      area: listing.area,
      floorLabel,
      phone: listing.phone,
      contactHref: `tel:${listing.phone.replace(/[^\d+]/g, "")}`,
      telegramHref: getTelegramLink(listing.telegramUsername),
      images: listing.images.map((img) => ({ id: img.id, url: img.url })),
      createdAt: listing.createdAt.toISOString()
    };
  });

  return (
    <div className="shell py-4 sm:py-6">
      <SavedListingsView
        initialListings={formattedItems}
        locale={locale}
        copy={t.savedPage}
      />
    </div>
  );
}
