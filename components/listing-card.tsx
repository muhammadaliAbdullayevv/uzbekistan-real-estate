import Link from "next/link";

import { FavoriteButton } from "@/components/favorite-button";
import { ListingCardPhotos } from "@/components/listing-card-photos";
import { LocationSummary } from "@/components/location-display";
import {
  formatDistance,
  formatPrice,
  formatPriceEquiv,
  getFurnishingLabel,
  getPropertyTypeLabel,
  getRentTypeLabel,
  getTelegramLink
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
  const hasNoAgencyFee =
    listing.title.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("no agency fee");
  const listingIndicator =
    listing.listingType === "sale" ? t.common.forSaleIndicator : t.common.forRentIndicator;
  const telegramHref = getTelegramLink(listing.telegramUsername);
  const callHref = `tel:${listing.phone}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-[#131922] to-[#0D1219] shadow-[0_18px_50px_-15px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_24px_60px_-15px_rgba(6,182,212,0.2)] sm:rounded-[30px]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0A0E14] sm:aspect-[4/3]">
        <Link
          href={`/listings/${listing.id}`}
          className="absolute inset-0 block overflow-hidden"
        >
          <ListingCardPhotos
            images={listing.images.map((image) => image.url)}
            alt={listing.title}
          />
          {/* Top Floating Glass Badges */}
          <div className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-1.5 p-2.5 pr-12 sm:p-3.5 sm:pr-14">
            <span className="badge-blur rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              {getPropertyTypeLabel(listing.propertyType, locale)}
            </span>
            {listing.listingType === "rent" && listing.rentType ? (
              <span className="rounded-full bg-cyan-500/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
                {getRentTypeLabel(listing.rentType, locale)}
              </span>
            ) : (
              <span className="rounded-full bg-amber-400/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
                {listingIndicator}
              </span>
            )}
            {listing.userId ? (
              <span className="hidden rounded-full bg-emerald-400/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-950 shadow-md sm:inline-flex">
                ✓ {t.common.verifiedOwner}
              </span>
            ) : null}
          </div>

          {/* Bottom Photo Overlay: Distance & Photo Count */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#090C10] via-[#090C10]/60 to-transparent p-3 sm:p-4">
            {listing.distanceKm !== undefined ? (
              <span className="badge-blur inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                {formatDistance(listing.distanceKm, locale)}
              </span>
            ) : (
              <span className="badge-blur inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                ✓ {hasNoAgencyFee ? t.common.noAgencyFee : listingIndicator}
              </span>
            )}

            {listing.images.length > 0 ? (
              <span className="badge-blur rounded-lg px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-200">
                1 / {listing.images.length}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="absolute right-2.5 top-2.5 z-10 sm:right-3.5 sm:top-3.5">
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
      <div className="flex flex-1 flex-col space-y-2.5 p-3.5 sm:space-y-3.5 sm:p-5">
        {/* Price & Specs Header */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="font-display text-lg font-extrabold leading-none text-cyan-400 sm:text-2xl">
              {formatPrice(
                listing.price,
                listing.currency,
                listing.listingType,
                listing.rentType,
                locale
              )}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              {formatPriceEquiv(listing.price, listing.currency, locale)}
            </p>
          </div>

          <div className="text-right">
            <span className="block text-xs font-extrabold text-white sm:text-sm">
              {listing.rooms} {t.common.roomsShort} · {listing.area} m²
            </span>
            {listing.furnishing ? (
              <span className="mt-0.5 inline-block text-[10px] font-semibold text-emerald-400">
                {getFurnishingLabel(listing.furnishing, locale)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Title & Location */}
        <div>
          <Link href={`/listings/${listing.id}`} className="block">
            <h3 className="line-clamp-2 text-xs font-bold leading-snug text-slate-100 transition group-hover:text-cyan-300 sm:text-base">
              {listing.title}
            </h3>
          </Link>
          <LocationSummary
            locale={locale}
            value={listing}
            className="mt-1 truncate text-[11px] font-medium text-slate-400 sm:text-xs"
          />
        </div>

        {/* Instant Customer Deal Triggers */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5">
          {telegramHref ? (
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-2.5 py-2 text-[11px] font-extrabold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-400 hover:to-cyan-400 sm:py-2.5 sm:text-xs"
            >
              <span aria-hidden="true">✈️</span>
              <span className="truncate">{t.common.telegramDirect}</span>
            </a>
          ) : (
            <a
              href={callHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-2.5 py-2 text-[11px] font-extrabold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-teal-300 sm:py-2.5 sm:text-xs"
            >
              <span aria-hidden="true">📞</span>
              <span className="truncate">{t.common.callDirect}</span>
            </a>
          )}

          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-[11px] font-bold text-white transition hover:border-cyan-400/40 hover:bg-white/10 sm:py-2.5 sm:text-xs"
          >
            {t.common.viewDetails}
          </Link>
        </div>
      </div>
    </article>
  );
}
