import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollapsibleDescription } from "@/components/collapsible-description";
import { FavoriteButton } from "@/components/favorite-button";
import { ListingCard } from "@/components/listing-card";
import { ListingGallery } from "@/components/listing-gallery";
import { ListingLocationViewer } from "@/components/listing-location-viewer";
import { ScheduleViewingModal } from "@/components/schedule-viewing-modal";
import { ShareButton } from "@/components/share-button";
import { SmartBackLink } from "@/components/smart-back-link";
import { TrackListingView } from "@/components/track-listing-view";
import {
  getAmenityLabel,
  getIncludedInPriceLabel
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

  const cleanedPhone = listing.phone ? listing.phone.trim() : "";
  const displayPhone = (() => {
    const digits = cleanedPhone.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length === 12) {
      return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
    }
    return cleanedPhone;
  })();
  const isRu = locale === "ru";

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
          <div className="w-full mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
            <ListingGallery
              images={listing.images.map((image) => image.url)}
              title={listing.title}
              locale={locale}
              topActions={
                <SmartBackLink label={locale === "ru" ? "Назад" : "Orqaga"} fallbackHref="/" />
              }
              floatingActions={
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg backdrop-blur-md transition active:scale-95">
                    <ShareButton title={listing.title} locale={locale} variant="icon" />
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg backdrop-blur-md transition active:scale-95">
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
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN CONTENT (Smooth bottom sheet on mobile, 2-col on desktop) */}
        {/* ============================================================== */}
        <div className="bg-white px-4 pb-28 space-y-4 sm:px-6 lg:shell lg:mt-6 lg:bg-transparent lg:p-0">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_410px] lg:gap-8 items-start">
            
            {/* ========================================================== */}
            {/* LEFT / MAIN COLUMN                                         */}
            {/* ========================================================== */}
            <div className="space-y-4 sm:space-y-5">

              {/* 1. ABOVE-THE-FOLD: STATUS BADGES, TITLE, LOCATION & VIEWS */}
              <div className="space-y-2 pt-1 lg:panel lg:p-5">
                {/* Status Badges: Rent/Sale · Property Type · Verified */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black tracking-wide ${
                      listing.listingType === "sale"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}
                  >
                    <span>{listing.listingType === "sale" ? "🏷️" : "🔑"}</span>
                    <span>{listingIndicator}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-black text-blue-800">
                    <span>🏠</span>
                    <span>{getPropertyTypeLabel(listing.propertyType, locale)}</span>
                  </span>

                  {listing.status === "APPROVED" ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                      <span className="text-blue-600 font-black">✓</span>
                      <span>{t.common.adminReviewed}</span>
                    </span>
                  ) : null}
                </div>

                {/* Listing Title */}
                <h1 className="font-display text-xl font-black text-slate-900 leading-snug sm:text-2xl pt-0.5">
                  {listing.title}
                </h1>

                {/* Single clean subtitle: location text + view count */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-0.5">
                  <p className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">📍</span>
                    <span className="truncate">{listing.district ? `${listing.district}, ${listing.region}` : listing.region}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0">
                    <span>👁</span>
                    <span>{viewCount}</span>
                  </div>
                </div>
              </div>

              {/* 2. COMPACT 4-SPECS IN ONE ROW (Rooms · Area · Floor · Furnishing) */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 lg:panel lg:p-4">
                <div className="grid grid-cols-4 text-center divide-x divide-slate-200/70">
                  {/* 1. Rooms */}
                  <div className="px-1">
                    <p className="font-display text-xl font-black text-slate-900 leading-tight sm:text-2xl">
                      {listing.rooms}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {t.common.roomsShort}
                    </p>
                  </div>

                  {/* 2. Area */}
                  <div className="px-1">
                    <p className="font-display text-xl font-black text-slate-900 leading-tight sm:text-2xl">
                      {listing.area}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      m²
                    </p>
                  </div>

                  {/* 3. Floor */}
                  <div className="px-1">
                    <p className="font-display text-xl font-black text-slate-900 leading-tight sm:text-2xl">
                      {floorSpecValue}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {floorSpecLabel}
                    </p>
                  </div>

                  {/* 4. Furnishing */}
                  <div className="px-1">
                    <p className="font-display text-xs font-black text-slate-800 leading-tight mt-1 sm:text-base truncate">
                      {listing.furnishing
                        ? getFurnishingLabel(listing.furnishing, locale)
                        : (isRu ? "Нет" : "Bo'sh")}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {isRu ? "мебель" : "jihoz"}
                    </p>
                  </div>
                </div>

                {/* Included in price pills if present */}
                {includedInPrice.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200/60 pt-2.5">
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

              {/* 3. CONSOLIDATED LOCATION & IN-APP MAP (Single dedicated place below specs!) */}
              <ListingLocationViewer
                region={listing.region}
                district={listing.district}
                address={listing.address}
                street={listing.street}
                title={listing.title}
                latitude={listing.latitude}
                longitude={listing.longitude}
                locale={locale}
              />

              {/* 4. UY QULAYLIKLARI (Amenities) */}
              {amenities.length > 0 ? (
                <section className="space-y-2.5 pt-1">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {isRu ? "Удобства" : "Uy qulayliklari"}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {amenities.slice(0, 4).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-800"
                      >
                        <span className="text-blue-600">✓</span>
                        <span>{getAmenityLabel(item, locale)}</span>
                      </span>
                    ))}
                  </div>
                  {amenities.length > 4 ? (
                    <details className="group pt-0.5">
                      <summary className="cursor-pointer font-bold text-xs text-blue-600 list-none select-none flex items-center justify-between py-1 hover:text-blue-700">
                        <span className="group-open:hidden">+ {amenities.length - 4} ta qulaylikni ko&apos;rish</span>
                        <span className="hidden group-open:inline">{isRu ? "Скрыть" : "Yashirish"}</span>
                        <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
                      </summary>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60 mt-1">
                        {amenities.slice(4).map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-800"
                          >
                            <span className="text-blue-600">✓</span>
                            <span>{getAmenityLabel(item, locale)}</span>
                          </span>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </section>
              ) : null}

              {/* 5. BU UY HAQIDA (About this home - clean of duplicate location lines) */}
              <section className="space-y-3 pt-2">
                <h2 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                  {isRu ? "Об этом жилье" : "Bu uy haqida"}
                </h2>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 text-xs sm:text-sm">
                  {/* Structured Details */}
                  <div className="space-y-1.5 font-medium text-slate-700">
                    <p className="font-bold text-slate-900 text-sm">
                      {getPropertyTypeLabel(listing.propertyType, locale)} · {listingIndicator}
                    </p>
                    <p className="text-slate-400 font-mono text-[11px]">
                      ID: {listing.id.slice(0, 8).toUpperCase()}
                    </p>
                    <ul className="space-y-1.5 pt-1 text-slate-600">
                      <li>• <span className="text-slate-500">{isRu ? "Комнат" : "Xona"}:</span> <span className="font-semibold text-slate-800">{listing.rooms}</span></li>
                      {listing.floor ? (
                        <li>• <span className="text-slate-500">{isRu ? "Этаж" : "Qavati"}:</span> <span className="font-semibold text-slate-800">{floorSpecValue}</span></li>
                      ) : null}
                      <li>• <span className="text-slate-500">{isRu ? "Площадь" : "Maydoni"}:</span> <span className="font-semibold text-slate-800">{listing.area} m²</span></li>
                      <li className="font-bold text-slate-900 pt-1.5">
                        <span className="text-slate-500 font-normal">{isRu ? "Цена" : "Narxi"}:</span>{" "}
                        <span className="text-blue-600 text-sm font-extrabold">
                          {formatPrice(listing.price, listing.currency, listing.listingType, listing.rentType, locale)}
                        </span>
                        {listing.negotiable ? (
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-600">({isRu ? "торг уместен" : "kami bor"})</span>
                        ) : null}
                      </li>
                    </ul>
                  </div>

                  {/* User custom description if present */}
                  {listing.description ? (
                    <div className="border-t border-slate-200/60 pt-3">
                      <CollapsibleDescription description={listing.description} locale={locale} />
                    </div>
                  ) : null}
                </div>
              </section>

              {/* 6. O'XSHASH UYLAR (Similar Listings) */}
              {similarListings.length > 0 ? (
                <section className="space-y-3 pt-2">
                  <h2 className="font-display text-sm font-extrabold text-slate-900 sm:text-base">
                    {isRu ? "Похожие дома" : "O'xshash uylar"}
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
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
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 pt-2.5 pb-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
          {/* Top Line: Price on Left, Phone Number with Modern Border on Right */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {formatPrice(
                    listing.price,
                    listing.currency,
                    listing.listingType,
                    listing.rentType,
                    locale
                  )}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {listing.listingType === "rent" ? (isRu ? "/мес" : "/oy") : ""}
                </span>
                {listing.negotiable ? (
                  <span className="ml-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/80 rounded px-1 py-0.5">
                    {isRu ? "торг" : "kami bor"}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 block leading-tight mt-0.5 truncate">
                {formatPriceEquiv(listing.price, listing.currency, locale)}
              </span>
            </div>

            {/* Phone Number in Modern Style with Border */}
            <a
              href={contactHref}
              aria-label={`Tel: ${displayPhone}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-black text-slate-800 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/50 active:scale-95"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{displayPhone}</span>
            </a>
          </div>

          {/* Bottom Line: Action Buttons */}
          <div className="flex items-center gap-2">
            {telegramHref ? (
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-200 bg-[#EFF6FF] text-blue-600 shadow-xs transition hover:bg-blue-100 active:scale-95"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </a>
            ) : null}

            <a
              href={contactHref}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-blue-600 bg-blue-600 py-3 px-4 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-98"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{isRu ? "Позвонить" : "Qo'ng'iroq qilish"}</span>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
