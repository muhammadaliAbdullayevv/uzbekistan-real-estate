import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollapsibleDescription } from "@/components/collapsible-description";
import { FavoriteButton } from "@/components/favorite-button";
import { ListingCard } from "@/components/listing-card";
import { ListingGallery } from "@/components/listing-gallery";
import { LocationSection } from "@/components/location-display";
import { NeighborhoodHighlights } from "@/components/neighborhood-highlights";
import { ScheduleViewingModal } from "@/components/schedule-viewing-modal";
import { ShareButton } from "@/components/share-button";
import { SmartBackLink } from "@/components/smart-back-link";
import { TrackListingView } from "@/components/track-listing-view";
import {
  getAmenityLabel,
  getIncludedInPriceLabel,
  getTenantPreferenceLabel
} from "@/lib/amenity-labels";
import { prisma } from "@/lib/db";
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
import { getApprovedListingById, getSimilarListings } from "@/lib/listings";
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

  // Fetch similar listings & view stats in parallel
  const [similarListings, viewCountRaw] = await Promise.all([
    getSimilarListings(listing, 4),
    prisma.listingView.count({ where: { listingId: listing.id } }).catch(() => 0)
  ]);
  const viewCount = Math.max(viewCountRaw, 1);

  const contactHref = `tel:${listing.phone}`;
  const telegramHref = getTelegramLink(listing.telegramUsername);
  const hasNoAgencyFee =
    listing.title.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("komissiyasiz");
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

  // Modern floor display: e.g. "4/9" or "4-qavat"
  const floorSpecValue =
    listing.propertyType === "house"
      ? listing.plotArea
        ? `${listing.plotArea} ${locale === "ru" ? "сот." : "sotix"}`
        : listing.totalFloors
          ? `${listing.totalFloors} ${locale === "ru" ? "эт." : "qav."}`
          : "-"
      : listing.floor && listing.totalFloors
        ? `${listing.floor}/${listing.totalFloors}`
        : listing.floor
          ? `${listing.floor}`
          : "-";

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

  const isRu = locale === "ru";

  const mainLocationSnippet = `${
    listing.district ? `${listing.district}, ${listing.region}` : listing.region
  } · ${listing.rooms} ${t.common.roomsShort} · ${getPropertyTypeLabel(
    listing.propertyType,
    locale
  )} · ${listing.area} m²`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <TrackListingView listingId={listing.id} enabled={Boolean(session)} />

      <div className="min-h-screen pb-28">

        {/* ============================================================== */}
        {/* DESKTOP BREADCRUMBS & TOP BAR (Desktop only)                    */}
        {/* ============================================================== */}
        <div className="shell hidden lg:flex items-center justify-between pt-4 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/" className="transition hover:text-blue-600">
              {isRu ? "Главная" : "Bosh sahifa"}
            </Link>
            <span>›</span>
            <span className="text-slate-600 font-semibold">{listing.region}</span>
            <span>›</span>
            <span className="line-clamp-1 max-w-md font-extrabold text-slate-900">
              {listing.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton title={listing.title} locale={locale} variant="button" />
            <FavoriteButton
              listingId={listing.id}
              isFavorited={isFavorited}
              variant="button"
              copy={{
                save: t.common.save,
                saved: t.common.saved,
                saveListing: t.common.saveListing,
                removeFromSaved: t.common.removeFromSaved
              }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* PHOTO GALLERY (Starts at top: 0 with zero gap!)               */}
        {/* ============================================================== */}
        <div className="w-full">
          <div className="shell lg:px-8 px-0 sm:px-6">
            <ListingGallery
              images={listing.images.map((image) => image.url)}
              title={listing.title}
              locale={locale}
              topActions={
                <>
                  <SmartBackLink label={locale === "ru" ? "Назад" : "Orqaga"} fallbackHref="/" />
                  <div className="flex items-center gap-2">
                    <ShareButton title={listing.title} locale={locale} variant="icon" />
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
                </>
              }
              badges={
                <>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs ${
                      listing.listingType === "sale" ? "bg-amber-600/90" : "bg-emerald-600/90"
                    }`}
                  >
                    {listingIndicator}
                  </span>
                  <span className="rounded-md bg-blue-600/90 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                    {getPropertyTypeLabel(listing.propertyType, locale)}
                  </span>
                </>
              }
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN CONTENT                                                   */}
        {/* ============================================================== */}
        <div className="shell mt-4 space-y-4 sm:space-y-6 sm:mt-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_410px] lg:gap-8 items-start">
            
            {/* ========================================================== */}
            {/* LEFT / MAIN COLUMN                                         */}
            {/* ========================================================== */}
            <div className="space-y-4 sm:space-y-5">

              {/* 1. LOCATION, TITLE & PRICE BLOCK (Directly below photo!) */}
              <div className="panel space-y-3 p-4 sm:p-5">
                {/* Location and Main Details Snippet */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 text-blue-600 font-extrabold">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{mainLocationSnippet}</span>
                  </span>
                </div>

                {/* Listing Title */}
                <h1 className="font-display text-lg font-black leading-snug text-slate-900 sm:text-2xl">
                  {listing.title}
                </h1>

                {/* Exact Address */}
                <p className="text-xs font-semibold text-slate-500">
                  📍 {listing.address}
                </p>

                {/* Price directly below Title and Location */}
                <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-black text-blue-600 tracking-tight sm:text-3xl">
                        {formatPrice(
                          listing.price,
                          listing.currency,
                          listing.listingType,
                          listing.rentType,
                          locale
                        )}
                      </span>
                      {listing.negotiable ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                          {locale === "ru" ? "Торг" : "Kami bor"}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      {formatPriceEquiv(listing.price, listing.currency, locale)}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    👁 {viewCount} {isRu ? "просмотров" : "ko'rildi"}
                  </span>
                </div>
              </div>

              {/* 2. 4-SPECS IN ONE SINGLE ROW (Floor like 4/9, Big Numbers, Small Title Under) */}
              <div className="panel p-3 sm:p-4">
                <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100 sm:gap-2">
                  {/* 1. Rooms */}
                  <div className="px-1">
                    <p className="font-display text-lg font-black text-slate-900 leading-tight sm:text-2xl">
                      {listing.rooms}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 sm:text-xs">
                      {t.common.rooms}
                    </p>
                  </div>

                  {/* 2. Area */}
                  <div className="px-1">
                    <p className="font-display text-lg font-black text-slate-900 leading-tight sm:text-2xl">
                      {listing.area} <span className="text-xs font-bold text-slate-500">m²</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 sm:text-xs">
                      {t.common.area}
                    </p>
                  </div>

                  {/* 3. Floor: 4/9 */}
                  <div className="px-1">
                    <p className="font-display text-lg font-black text-slate-900 leading-tight sm:text-2xl">
                      {floorSpecValue}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 sm:text-xs">
                      {floorSpecLabel}
                    </p>
                  </div>

                  {/* 4. Furnishing */}
                  <div className="px-1">
                    <p className="font-display text-sm font-black text-emerald-600 leading-tight truncate sm:text-lg">
                      {listing.furnishing
                        ? getFurnishingLabel(listing.furnishing, locale)
                        : (isRu ? "Нет" : "Bo'sh")}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 sm:text-xs">
                      {isRu ? "Мебель" : "Jihoz"}
                    </p>
                  </div>
                </div>

                {/* Included in price pills if present */}
                {includedInPrice.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                    {includedInPrice.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800"
                      >
                        <span>✓</span>
                        <span>{getIncludedInPriceLabel(item, locale)}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* 3. MULKDOR (Clean, light & trustworthy trust card) */}
              <div className="panel p-3.5 sm:p-4 bg-gradient-to-r from-blue-50/50 via-white to-white border border-blue-100 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-display text-sm font-black text-white shadow-xs">
                      {ownerInitials}
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-display text-sm font-extrabold text-slate-900">
                        {ownerName || (isRu ? "Владелец" : "Mulkdor")}
                      </p>
                      <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                        ✓ {isRu ? "Проверен" : "Egasi"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {isRu ? "Быстрый ответ (в теч. 15 мин)" : "Tez javob beradi (15 daqiqada)"}
                    </p>
                  </div>
                </div>

                <a
                  href={contactHref}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-blue-500 active:scale-95"
                >
                  {isRu ? "Позвонить" : "Qo'ng'iroq"}
                </a>
              </div>

              {/* 4. COLLAPSIBLE DESCRIPTION CARD */}
              <section className="panel space-y-2.5 p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h2 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                    {t.common.fullDescription}
                  </h2>
                  <span className="text-[11px] font-bold text-slate-400">
                    {formatDate(listing.createdAt, locale)}
                  </span>
                </div>

                <CollapsibleDescription description={listing.description} locale={locale} />
              </section>

              {/* 5. AMENITIES & FEATURES */}
              {amenities.length > 0 || tenantPreferences.length > 0 ? (
                <section className="panel space-y-4 p-4 sm:p-6">
                  {amenities.length > 0 ? (
                    <div>
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                        {isRu ? "Что есть в доме" : "Uy qulayliklari"}
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
                    <div className={amenities.length > 0 ? "border-t border-slate-100 pt-4" : ""}>
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                        {listing.listingType === "sale"
                          ? isRu
                            ? "Документы и состояние"
                            : "Hujjatlar va uy holati"
                          : isRu
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

              {/* 6. NEIGHBORHOOD INFRASTRUCTURE */}
              <section className="panel space-y-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-extrabold text-slate-900">
                    {isRu ? "Инфраструктура поблизости" : "Atrofdagi infratuzilma"}
                  </h2>
                  <span className="text-[11px] font-bold text-blue-600">
                    {isRu ? "Рядом" : "Yaqinida"}
                  </span>
                </div>

                <NeighborhoodHighlights locale={locale} />
              </section>

              {/* 7. LOCATION & MAP */}
              <section className="panel space-y-3 p-4 sm:p-6">
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  {t.common.location}
                </h2>
                <LocationSection locale={locale} value={listing} />
              </section>

              {/* 8. SIMILAR LISTINGS */}
              {similarListings.length > 0 ? (
                <section className="space-y-4 pt-4">
                  <div>
                    <h2 className="font-display text-lg font-black text-slate-900 sm:text-xl">
                      {isRu ? "Похожие объявления" : "O'xshash e'lonlar"}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {isRu
                        ? `Другие варианты в регионе ${listing.region}`
                        : `${listing.region} hududidagi boshqa e'lonlar`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {similarListings.map((sim) => (
                      <ListingCard
                        key={sim.id}
                        locale={locale}
                        listing={sim}
                        isFavorited={favoriteIds.has(sim.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

            </div>

            {/* ========================================================== */}
            {/* RIGHT COLUMN (DESKTOP STICKY DEAL CARD)                   */}
            {/* ========================================================== */}
            <aside id="contact-panel" className="hidden lg:block sticky top-24 space-y-4">
              <div className="panel space-y-5 p-6 shadow-xl">
                {/* Price Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <p className="font-display text-3xl font-black tabular-nums tracking-tight text-blue-600">
                        {formatPrice(
                          listing.price,
                          listing.currency,
                          listing.listingType,
                          listing.rentType,
                          locale
                        )}
                      </p>
                      <span className="text-xs font-bold text-slate-400 mt-0.5 block">
                        {formatPriceEquiv(listing.price, listing.currency, locale)}
                      </span>
                    </div>
                    {listing.negotiable ? (
                      <span className="pill border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold">
                        {locale === "ru" ? "Торг уместен" : "Kami bor"}
                      </span>
                    ) : null}
                  </div>

                  {/* Verified Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="rounded-md border border-blue-200 bg-[#EFF6FF] px-2 py-0.5 text-blue-700">
                      ✓ {t.common.adminReviewed}
                    </span>
                    {listing.userId ? (
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                        ✓ {t.common.verifiedOwner}
                      </span>
                    ) : null}
                    {hasNoAgencyFee ? (
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">
                        {t.common.noAgencyFee}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Landlord Info Box */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-display text-sm font-black text-white shadow-xs">
                    {ownerInitials}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold text-slate-900 truncate">
                      {ownerName || (isRu ? "Владелец" : "Mulkdor")}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {isRu ? "Отвечает за 15 мин" : "15 daqiqada javob beradi"}
                    </p>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="space-y-2.5">
                  <a
                    href={contactHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-98"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{listing.phone} ({isRu ? "Позвонить" : "Qo'ng'iroq"})</span>
                  </a>

                  {telegramHref ? (
                    <a
                      href={telegramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-[#EFF6FF] px-5 py-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        <span>{t.common.messageOwner}</span>
                      </button>
                    </form>
                  ) : null}

                  <ScheduleViewingModal
                    listingTitle={listing.title}
                    phone={listing.phone}
                    telegramUsername={listing.telegramUsername}
                    locale={locale}
                  />
                </div>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  🔒 {isRu ? "Без комиссии риелтора · Напрямую от владельца" : "Rieltor komissiyasisiz · To'g'ridan-to'g'ri egasidan"}
                </p>
              </div>
            </aside>

          </div>
        </div>

        {/* ============================================================== */}
        {/* UNCLOSABLE STICKY BOTTOM CONTACT BAR                           */}
        {/* ============================================================== */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
          <div className="min-w-[85px] leading-tight">
            <p className="font-display text-lg font-black text-blue-600">
              {formatPrice(
                listing.price,
                listing.currency,
                listing.listingType,
                listing.rentType,
                locale
              )}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {listing.listingType === "rent" ? (isRu ? "в месяц" : "oyiga") : (isRu ? "narxi" : "narxi")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-1">
            {telegramHref ? (
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-[#EFF6FF] py-3 text-xs font-black text-blue-700 shadow-2xs hover:bg-blue-100 active:scale-95"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span>Telegram</span>
              </a>
            ) : null}

            <a
              href={contactHref}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-xs font-black text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 active:scale-95"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{isRu ? "Позвонить" : "Qo'ng'iroq"}</span>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
