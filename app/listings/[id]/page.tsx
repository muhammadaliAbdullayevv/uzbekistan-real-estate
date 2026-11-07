import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/favorite-button";
import { ListingGallery } from "@/components/listing-gallery";
import { LocationSection, LocationSummary } from "@/components/location-display";
import { SmartBackLink } from "@/components/smart-back-link";
import { TrackListingView } from "@/components/track-listing-view";
import { getFavoriteListingIds, getVisitorId } from "@/lib/favorites";
import {
  formatDate,
  formatPrice,
  formatPriceEquiv,
  getFurnishingLabel,
  getPropertyTypeLabel,
  getRentTypeLabel,
  getTelegramLink
} from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
import { buildListingJsonLd, serializeJsonLd } from "@/lib/listing-json-ld";
import { formatLocationSummary } from "@/lib/locations";
import { getApprovedListingById } from "@/lib/listings";
import { siteConfig } from "@/lib/site";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

type ListingDetailPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params
}: ListingDetailPageProps): Promise<Metadata> {
  const locale = getLocale();
  const t = getTranslations(locale);
  const listing = await getApprovedListingById(params.id);

  if (!listing) {
    return {
      title: t.listingDetail.listingNotFound,
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const description = `${listing.rooms} ${t.common.roomsShort} · ${listing.area} m² · ${formatPrice(
    listing.price,
    listing.currency,
    listing.listingType,
    listing.rentType,
    locale
  )} · ${formatLocationSummary(listing, locale)} · ${listing.address}`;
  const image = listing.images[0]?.url;

  return {
    title: listing.title,
    description,
    openGraph: {
      title: `${listing.title} | ${siteConfig.name}`,
      description,
      type: "article",
      images: image ? [{ url: image, alt: listing.title }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${listing.title} | ${siteConfig.name}`,
      description,
      images: image ? [image] : undefined
    }
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();
  const listing = await getApprovedListingById(params.id);

  if (!listing) {
    notFound();
  }

  const contactHref = `tel:${listing.phone}`;
  const telegramHref = getTelegramLink(listing.telegramUsername);
  const hasNoAgencyFee =
    listing.title.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("no agency fee");
  const listingIndicator =
    listing.listingType === "sale" ? t.common.forSaleIndicator : t.common.forRentIndicator;
  const listingIndicatorClass =
    listing.listingType === "sale"
      ? "border-amber-400/30 bg-amber-500/15 text-amber-300"
      : "border-emerald-400/30 bg-emerald-500/15 text-emerald-300";
  const canMessageOwner = listing.userId && (!session || session.userId !== listing.userId);
  const jsonLd = buildListingJsonLd(listing);
  const visitorId = getVisitorId();
  const favoriteIds = await getFavoriteListingIds(visitorId, session?.userId ?? null);
  const isFavorited = favoriteIds.has(listing.id);

  return (
    <div className="shell space-y-6 pb-20 sm:space-y-8 sm:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <TrackListingView listingId={listing.id} enabled={Boolean(session)} />

      <SmartBackLink label={t.common.backToListings} fallbackHref="/" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px] xl:gap-8">
        <div className="space-y-6">
          <ListingGallery images={listing.images.map((image) => image.url)} title={listing.title} />

          <section className="panel space-y-3 p-5 sm:p-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-400">
                {t.common.overview}
              </p>
              <h2 className="mt-1 font-display text-lg font-extrabold text-white sm:text-xl">
                {t.common.fullDescription}
              </h2>
            </div>
            <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {listing.description}
            </p>
          </section>
        </div>

        <aside id="contact-panel" className="panel h-fit space-y-0 p-5 sm:p-7">
          <div className="border-b border-white/10 pb-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`pill ${listingIndicatorClass}`}>{listingIndicator}</span>
              <span className="pill">
                {getPropertyTypeLabel(listing.propertyType, locale)}
              </span>
              {listing.listingType === "rent" && listing.rentType ? (
                <span className="pill border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
                  {getRentTypeLabel(listing.rentType, locale)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
              {listing.title}
            </h1>
            <LocationSummary
              locale={locale}
              value={listing}
              className="mt-1.5 text-sm font-medium text-slate-400"
            />
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-cyan-400">
                {formatPrice(
                  listing.price,
                  listing.currency,
                  listing.listingType,
                  listing.rentType,
                  locale
                )}
              </p>
              <span className="text-sm font-semibold text-slate-400">
                {formatPriceEquiv(listing.price, listing.currency, locale)}
              </span>
            </div>
          </div>

          <section className="border-b border-white/10 py-5">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
              {t.common.propertyInfo}
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center">
                <p className="text-base font-extrabold leading-none text-white">{listing.rooms}</p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{t.common.rooms}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center">
                <p className="text-base font-extrabold leading-none text-white">{listing.area} m²</p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{t.common.area}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center">
                <p className="truncate text-xs font-extrabold leading-none text-white" title={getPropertyTypeLabel(listing.propertyType, locale)}>
                  {getPropertyTypeLabel(listing.propertyType, locale)}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{t.common.propertyType}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center">
                <p className="truncate text-xs font-extrabold leading-none text-cyan-300">
                  {listing.furnishing
                    ? getFurnishingLabel(listing.furnishing, locale)
                    : listing.currency}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                  {listing.furnishing ? "Jihoz" : "Valyuta"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-cyan-300">
                ✓ {t.common.adminReviewed}
              </span>
              {listing.userId ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-emerald-300">
                  ✓ {t.common.verifiedOwner}
                </span>
              ) : null}
              {hasNoAgencyFee ? (
                <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-amber-300">
                  {t.common.noAgencyFee}
                </span>
              ) : null}
            </div>
          </section>

          <LocationSection locale={locale} value={listing} className="border-b border-white/10 py-5" />

          <section className="space-y-4 pt-5">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {t.common.ownerContact}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {t.common.created}: {formatDate(listing.createdAt, locale)}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span className="text-base font-extrabold tabular-nums text-white">{listing.phone}</span>
            </div>

            <div className="space-y-2.5">
              {telegramHref ? (
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-400 hover:to-cyan-400"
                >
                  <span aria-hidden="true">✈️</span>
                  <span>{t.common.telegramDirect}</span>
                </a>
              ) : null}

              <a href={contactHref} className="btn-primary w-full gap-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {t.common.contactOwner}
              </a>

              {canMessageOwner && session ? (
                <form action="/api/conversations" method="post">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button type="submit" className="btn-secondary w-full gap-2">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    {t.common.messageOwner}
                  </button>
                </form>
              ) : null}

              <FavoriteButton
                listingId={listing.id}
                isFavorited={isFavorited}
                copy={{
                  save: t.common.save,
                  saved: t.common.saved,
                  saveListing: t.common.saveListing,
                  removeFromSaved: t.common.removeFromSaved
                }}
              />
            </div>
          </section>
        </aside>
      </div>

      {/* Sticky Mobile Deal Action Bar (Always accessible while reading/scrolling on phone) */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 flex items-center gap-2.5 border-t border-white/10 bg-[#090C10]/95 px-4 py-2.5 backdrop-blur-xl sm:hidden">
        {telegramHref ? (
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/20"
          >
            <span aria-hidden="true">✈️</span>
            <span>{t.common.telegramDirect}</span>
          </a>
        ) : null}
        <a
          href={contactHref}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20"
        >
          <span aria-hidden="true">📞</span>
          <span>{t.common.callDirect}</span>
        </a>
      </div>
    </div>
  );
}
