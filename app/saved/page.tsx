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

    const priceFormatted = formatPrice(
      listing.price,
      listing.currency,
      listing.listingType,
      listing.rentType,
      locale
    );

    const cleanDigits = listing.phone.replace(/\D/g, "");
    const phoneFormatted =
      cleanDigits.length === 12 && cleanDigits.startsWith("998")
        ? `+998 ${cleanDigits.slice(3, 5)} ${cleanDigits.slice(5, 8)} ${cleanDigits.slice(8, 10)} ${cleanDigits.slice(10, 12)}`
        : cleanDigits.length === 9
          ? `+998 ${cleanDigits.slice(0, 2)} ${cleanDigits.slice(2, 5)} ${cleanDigits.slice(5, 7)} ${cleanDigits.slice(7, 9)}`
          : listing.phone;

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
      phone: phoneFormatted,
      contactHref: `tel:${cleanDigits ? `+${cleanDigits}` : listing.phone}`,
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
