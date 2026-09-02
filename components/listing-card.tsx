import Link from "next/link";

import { FavoriteButton } from "@/components/favorite-button";
import { PropertyImage } from "@/components/property-image";
import { LocationSummary } from "@/components/location-display";
import {
  formatPrice,
  getPropertyTypeLabel,
  getRentTypeLabel
} from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import type { ListingWithImages } from "@/lib/listings";

type ListingCardProps = {
  locale: Locale;
  listing: ListingWithImages;
  isFavorited?: boolean;
  canFavorite?: boolean;
};

export function ListingCard({
  locale,
  listing,
  isFavorited = false,
  canFavorite = false
}: ListingCardProps) {
  const t = getTranslations(locale);
  const image = listing.images[0]?.url;
  const saveHref = `/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`;
  const hasNoAgencyFee =
    listing.title.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("no agency fee");
  const listingIndicator =
    listing.listingType === "sale" ? t.common.forSaleIndicator : t.common.forRentIndicator;
  const listingIndicatorClass =
    listing.listingType === "sale"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line/70 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)] sm:rounded-[30px]">
      <div className="relative aspect-[16/9] overflow-hidden bg-mist sm:aspect-[4/3]">
        <Link
          href={`/listings/${listing.id}`}
          className="absolute inset-0 block overflow-hidden"
        >
          <PropertyImage
            src={image}
            alt={listing.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1 p-2 sm:gap-2 sm:p-4">
            <span className="rounded-full bg-white/92 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink shadow-sm sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.16em]">
              {getPropertyTypeLabel(listing.propertyType, locale)}
            </span>
            {listing.listingType === "rent" && listing.rentType ? (
              <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-accent shadow-sm sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.16em]">
                {getRentTypeLabel(listing.rentType, locale)}
              </span>
            ) : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-2.5 sm:p-5">
            <p className="font-display text-[1.05rem] font-semibold leading-none text-white sm:text-[2.3rem]">
              {formatPrice(
                listing.price,
                listing.currency,
                listing.listingType,
                listing.rentType,
                locale
              )}
            </p>
          </div>
        </Link>
        <div className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4">
          <FavoriteButton
            listingId={listing.id}
            isFavorited={isFavorited}
            canFavorite={canFavorite}
            loginHref={saveHref}
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

      <div className="flex flex-1 flex-col space-y-2 p-3.5 sm:space-y-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.16em] ${listingIndicatorClass}`}
          >
            {listingIndicator}
          </span>
          {listing.userId ? (
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 sm:inline-flex">
              {t.common.verifiedOwner}
            </span>
          ) : null}
          {hasNoAgencyFee ? (
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700 sm:inline-flex">
              {t.common.noAgencyFee}
            </span>
          ) : null}
        </div>

        <div>
          <Link href={`/listings/${listing.id}`} className="block">
            <h3 className="line-clamp-2 font-display text-[0.92rem] font-semibold leading-tight text-ink transition group-hover:text-accent sm:text-[1.45rem]">
              {listing.title}
            </h3>
          </Link>
          <LocationSummary
            locale={locale}
            value={listing}
            className="mt-1.5 truncate text-[12px] text-ink/60 sm:mt-2 sm:text-sm"
          />
        </div>

        <p className="truncate text-[12px] text-ink/72 sm:text-sm">
          {listing.rooms} {t.common.roomsShort} · {listing.area} m² · {listing.currency}
        </p>

        <div className="mt-auto grid gap-3 pt-1">
          <Link
            href={`/listings/${listing.id}`}
            className="btn-primary w-full py-2.5 text-center sm:py-3"
          >
            {t.common.viewDetails}
          </Link>
        </div>
      </div>
    </article>
  );
}
