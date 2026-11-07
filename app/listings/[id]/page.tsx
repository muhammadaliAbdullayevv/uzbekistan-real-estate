import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/favorite-button";
import { ListingGallery } from "@/components/listing-gallery";
import { LocationSection, LocationSummary } from "@/components/location-display";
import { SmartBackLink } from "@/components/smart-back-link";
import { TrackListingView } from "@/components/track-listing-view";
import {
  getAmenityLabel,
  getIncludedInPriceLabel,
  getTenantPreferenceLabel
} from "@/lib/amenity-labels";
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
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const canMessageOwner = listing.userId && (!session || session.userId !== listing.userId);
  const jsonLd = buildListingJsonLd(listing);
  const visitorId = getVisitorId();
  const favoriteIds = await getFavoriteListingIds(visitorId, session?.userId ?? null);
  const isFavorited = favoriteIds.has(listing.id);

  const floorSpecValue =
    listing.propertyType === "house"
      ? listing.plotArea
        ? `${listing.plotArea} ${locale === "ru" ? "сот." : "sotix"}`
        : listing.totalFloors
          ? `${listing.totalFloors} ${locale === "ru" ? "эт." : "qavat"}`
          : null
      : listing.floor && listing.totalFloors
        ? `${listing.floor}/${listing.totalFloors}`
        : listing.floor
          ? `${listing.floor}`
          : null;

  const floorSpecLabel =
    listing.propertyType === "house" && listing.plotArea
      ? locale === "ru"
        ? "Участок"
        : "Er maydoni"
      : locale === "ru"
        ? "Этаж"
        : "Qavat";

  const amenities = listing.amenities ?? [];
  const tenantPreferences = listing.tenantPreferences ?? [];
  const includedInPrice = listing.includedInPrice ?? [];
  const ownerName = listing.contactName?.trim() || null;
  const ownerInitials = ownerName
    ? ownerName
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "UY";

  return (
    <div className="shell space-y-5 pb-24 sm:space-y-7 sm:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <TrackListingView listingId={listing.id} enabled={Boolean(session)} />

      <SmartBackLink label={t.common.backToListings} fallbackHref="/" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px] xl:gap-8">
        <div className="space-y-5">
          <ListingGallery images={listing.images.map((image) => image.url)} title={listing.title} />

          {/* Full Description Card */}
          <section className="panel space-y-3 p-5 sm:p-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
                {t.common.overview}
              </p>
              <h2 className="mt-1 font-display text-lg font-extrabold text-slate-900 sm:text-xl">
                {t.common.fullDescription}
              </h2>
            </div>
            <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {listing.description}
            </p>
          </section>

          {/* Amenities & Tenant Preferences Card (if present) */}
          {amenities.length > 0 || tenantPreferences.length > 0 ? (
            <section className="panel space-y-4 p-5 sm:p-6">
              {amenities.length > 0 ? (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "ru" ? "Что есть в доме" : "Uyda nimalar bor"}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {amenities.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-[#EFF6FF] px-3 py-1.5 text-xs font-extrabold text-blue-800"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {getAmenityLabel(item, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {tenantPreferences.length > 0 ? (
                <div className={amenities.length > 0 ? "border-t border-slate-200 pt-4" : ""}>
                  <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    {listing.listingType === "sale"
                      ? locale === "ru"
                        ? "Документы и состояние"
                        : "Hujjatlar va uy holati"
                      : locale === "ru"
                        ? "Кому подходит"
                        : "Kimlar uchun mos"}
                  </h2>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {tenantPreferences.map((pref) => (
                      <span
                        key={pref}
                        className="inline-flex items-center rounded-xl border border-slate-200 bg-[#F3F6FB] px-3 py-1.5 text-xs font-bold text-slate-700"
                      >
                        {getTenantPreferenceLabel(pref, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside id="contact-panel" className="h-fit space-y-4">
          {/* Primary Info Surface (Pure White Card) */}
          <div className="panel space-y-5 p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`pill ${listingIndicatorClass}`}>{listingIndicator}</span>
                <span className="pill border-blue-200 bg-[#EFF6FF] text-blue-700">
                  {getPropertyTypeLabel(listing.propertyType, locale)}
                </span>
                {listing.listingType === "rent" && listing.rentType ? (
                  <span className="pill">
                    {getRentTypeLabel(listing.rentType, locale)}
                  </span>
                ) : null}
                {listing.negotiable ? (
                  <span className="pill border-emerald-200 bg-emerald-50 text-emerald-700">
                    {locale === "ru" ? "Торг уместен" : "Kami bor"}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 font-display text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
                {listing.title}
              </h1>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <LocationSummary locale={locale} value={listing} />
              </div>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-3xl font-extrabold tabular-nums tracking-tight text-blue-600">
                  {formatPrice(
                    listing.price,
                    listing.currency,
                    listing.listingType,
                    listing.rentType,
                    locale
                  )}
                </p>
                <span className="text-sm font-bold text-slate-500">
                  {formatPriceEquiv(listing.price, listing.currency, locale)}
                </span>
              </div>

              {includedInPrice.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {includedInPrice.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800"
                    >
                      <span>✓</span>
                      <span>{getIncludedInPriceLabel(item, locale)}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Soft Sky-Tinted Spec Grid (#F3F6FB) */}
            <section className="border-b border-slate-200 pb-5">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                {t.common.propertyInfo}
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/90 bg-[#F3F6FB] px-2 py-3 text-center">
                  <p className="text-base font-extrabold leading-none text-slate-900">{listing.rooms}</p>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">{t.common.rooms}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/90 bg-[#F3F6FB] px-2 py-3 text-center">
                  <p className="text-base font-extrabold leading-none text-slate-900">{listing.area} m²</p>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">{t.common.area}</p>
                </div>
                {floorSpecValue ? (
                  <div className="rounded-2xl border border-slate-200/90 bg-[#F3F6FB] px-2 py-3 text-center">
                    <p className="text-base font-extrabold leading-none text-slate-900">{floorSpecValue}</p>
                    <p className="mt-1.5 text-[11px] font-bold text-slate-500">{floorSpecLabel}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/90 bg-[#F3F6FB] px-2 py-3 text-center">
                    <p className="truncate text-xs font-extrabold leading-none text-slate-900" title={getPropertyTypeLabel(listing.propertyType, locale)}>
                      {getPropertyTypeLabel(listing.propertyType, locale)}
                    </p>
                    <p className="mt-1.5 text-[11px] font-bold text-slate-500">{t.common.propertyType}</p>
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200/90 bg-[#F3F6FB] px-2 py-3 text-center">
                  <p className="truncate text-xs font-extrabold leading-none text-blue-600">
                    {listing.furnishing
                      ? getFurnishingLabel(listing.furnishing, locale)
                      : listing.currency}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">
                    {listing.furnishing ? (locale === "ru" ? "Мебель" : "Jihoz") : "Valyuta"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-blue-200 bg-[#EFF6FF] px-3 py-1 text-blue-700">
                  ✓ {t.common.adminReviewed}
                </span>
                {listing.userId ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                    ✓ {t.common.verifiedOwner}
                  </span>
                ) : null}
                {hasNoAgencyFee ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
                    {t.common.noAgencyFee}
                  </span>
                ) : null}
              </div>
            </section>

            <LocationSection locale={locale} value={listing} />

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

          {/* High-Contrast Deep Slate Owner Contact Card (#0F172A) */}
          <section className="rounded-[26px] border border-slate-800 bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5 text-white shadow-xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  {t.common.ownerContact}
                </h2>
                {ownerName ? (
                  <p className="mt-1 font-display text-base font-extrabold text-white">
                    {ownerName}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-slate-400">
                  {t.common.created}: {formatDate(listing.createdAt, locale)}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-display text-sm font-extrabold text-white">
                {ownerInitials}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="text-base font-extrabold tabular-nums text-white">{listing.phone}</span>
              </div>

              {listing.contactEmail ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <span className="truncate text-xs font-bold text-slate-200">{listing.contactEmail}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-2.5">
              <a
                href={contactHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {t.common.contactOwner}
              </a>

              {telegramHref ? (
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  <span>{t.common.telegramDirect}</span>
                </a>
              ) : null}

              {canMessageOwner && session ? (
                <form action="/api/conversations" method="post">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    {t.common.messageOwner}
                  </button>
                </form>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      {/* Sticky Mobile Deal Action Bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 flex items-center gap-2.5 border-t border-slate-200 bg-white/95 px-4 py-2.5 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:hidden">
        {telegramHref ? (
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-[#EFF6FF] py-3 text-xs font-extrabold text-blue-700"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            <span>{t.common.telegramDirect}</span>
          </a>
        ) : null}
        <a
          href={contactHref}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] py-3 text-xs font-extrabold text-white shadow-md shadow-blue-600/20"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{t.common.callDirect}</span>
        </a>
      </div>
    </div>
  );
}
