import Link from "next/link";

import { FavoriteButton } from "@/components/favorite-button";
import { ListingCardPhotos } from "@/components/listing-card-photos";
import { LocationSummary } from "@/components/location-display";
import {
  formatDistance,
  formatPrice,
  getFurnishingLabel,
  getPropertyTypeLabel
} from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import type { ListingWithImages } from "@/lib/listings";

type ListingCardProps = {
  locale: Locale;
  listing: ListingWithImages;
  isFavorited?: boolean;
};

export function ListingCard({ locale, listing, isFavorited = false }: ListingCardProps) {
  const t = getTranslations(locale);
  const floorLabel =
    listing.propertyType === "house"
      ? [
          listing.plotArea ? `${listing.plotArea} ${locale === "ru" ? "сот." : "sotix"}` : null,
          listing.totalFloors ? `${listing.totalFloors} ${locale === "ru" ? "эт." : "qavat"}` : null
        ]
          .filter(Boolean)
          .join(" · ")
      : listing.floor && listing.totalFloors
        ? `${listing.floor}/${listing.totalFloors} ${locale === "ru" ? "эт." : "qavat"}`
        : listing.floor
          ? `${listing.floor}-${locale === "ru" ? "эт." : "qavat"}`
          : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white shadow-[0_8px_22px_-8px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-[0_16px_36px_-10px_rgba(37,99,235,0.16)] sm:rounded-[26px]">
      {/* Photo: ONLY the like/heart button on the photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <Link
          href={`/listings/${listing.id}`}
          className="absolute inset-0 block overflow-hidden"
        >
          <ListingCardPhotos
            images={listing.images.map((image) => image.url)}
            alt={listing.title}
          />
        </Link>

        <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
          <FavoriteButton
            listingId={listing.id}
            isFavorited={isFavorited}
            variant="icon"
            copy={{
              save: t.common.save,
              saved: t.common.saved,
              saveListing: t.common.saveListing,
              removeFromSaved: t.common.removeFromSaved
            }}
          />
        </div>
      </div>

      {/* Card Body */}
      <Link
        href={`/listings/${listing.id}`}
        className="flex flex-1 flex-col justify-between gap-2 p-3 sm:gap-2.5 sm:p-4"
      >
        <div className="space-y-1.5">
          {/* Price Row */}
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <p className="font-display text-base font-extrabold leading-none tracking-tight text-blue-600 sm:text-xl">
              {formatPrice(
                listing.price,
                listing.currency,
                listing.listingType,
                listing.rentType,
                locale
              )}
            </p>
            {listing.negotiable ? (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                {locale === "ru" ? "Торг" : "Kami bor"}
              </span>
            ) : null}
          </div>

          {/* Specs Row: Rooms · Area · Floor */}
          <p className="truncate text-[11px] font-bold text-slate-700 sm:text-xs">
            {listing.rooms} {t.common.roomsShort} · {listing.area} m²
            {floorLabel ? ` · ${floorLabel}` : ""}
          </p>

          {/* Title */}
          <h3 className="line-clamp-2 text-xs font-extrabold leading-snug text-slate-900 transition group-hover:text-blue-600 sm:text-sm">
            {listing.title}
          </h3>
        </div>

        {/* Bottom Location & Spec Tag */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 sm:text-xs">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3 w-3 shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <LocationSummary locale={locale} value={listing} className="truncate" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-[#F3F6FB] px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {getPropertyTypeLabel(listing.propertyType, locale)}
            </span>
            {listing.furnishing ? (
              <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50/70 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {getFurnishingLabel(listing.furnishing, locale)}
              </span>
            ) : null}
            {listing.distanceKm !== undefined ? (
              <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {formatDistance(listing.distanceKm, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
