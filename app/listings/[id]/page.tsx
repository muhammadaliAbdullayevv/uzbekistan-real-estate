import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingGallery } from "@/components/listing-gallery";
import { LocationSection, LocationSummary } from "@/components/location-display";
import { SmartBackLink } from "@/components/smart-back-link";
import { TrackListingView } from "@/components/track-listing-view";
import {
  formatDate,
  formatPrice,
  getListingTypeLabel,
  getPropertyTypeLabel,
  getRentTypeLabel
} from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
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

  const loginToContactHref = `/login?next=${encodeURIComponent(`/listings/${listing.id}#contact-panel`)}`;
  const contactHref = `tel:${listing.phone}`;
  const hasNoAgencyFee =
    listing.title.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("no agency fee");
  const listingIndicator =
    listing.listingType === "sale" ? t.common.forSaleIndicator : t.common.forRentIndicator;
  const listingIndicatorClass =
    listing.listingType === "sale"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  const canMessageOwner = listing.userId && (!session || session.userId !== listing.userId);

  return (
    <div className="shell space-y-8">
      <TrackListingView listingId={listing.id} enabled={Boolean(session)} />

      <SmartBackLink label={t.common.backToListings} fallbackHref="/" />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_420px]">
        <div className="space-y-6">
          <ListingGallery images={listing.images.map((image) => image.url)} title={listing.title} />

          <section className="panel space-y-3 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                {t.common.overview}
              </p>
              <h2 className="mt-1.5 font-display text-lg font-semibold text-ink">
                {t.common.fullDescription}
              </h2>
            </div>
            <p className="max-w-4xl whitespace-pre-line text-sm leading-6 text-ink/70">
              {listing.description}
            </p>
          </section>
        </div>

        <aside id="contact-panel" className="panel h-fit space-y-0 p-5 sm:p-7">
          <div className="border-b border-line/70 pb-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`pill ${listingIndicatorClass}`}>{listingIndicator}</span>
              <span className="pill border-line bg-mist text-ink/70">
                {getPropertyTypeLabel(listing.propertyType, locale)}
              </span>
              {listing.listingType === "rent" && listing.rentType ? (
                <span className="pill border-accent/25 bg-accent/5 text-accent">
                  {getRentTypeLabel(listing.rentType, locale)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
              {listing.title}
            </h1>
            <LocationSummary
              locale={locale}
              value={listing}
              className="mt-1.5 text-sm text-ink/60"
            />
            <p className="mt-3 font-sans text-3xl font-extrabold tabular-nums tracking-tight text-ink">
              {formatPrice(
                listing.price,
                listing.currency,
                listing.listingType,
                listing.rentType,
                locale
              )}
            </p>
          </div>

          <section className="border-b border-line/70 py-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
              {t.common.propertyInfo}
            </h2>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-mist/70 px-2 py-3 text-center">
                <p className="text-lg font-bold leading-none text-ink">{listing.rooms}</p>
                <p className="mt-1.5 text-[11px] font-medium text-ink/50">{t.common.rooms}</p>
              </div>
              <div className="rounded-2xl bg-mist/70 px-2 py-3 text-center">
                <p className="text-lg font-bold leading-none text-ink">{listing.area} m²</p>
                <p className="mt-1.5 text-[11px] font-medium text-ink/50">{t.common.area}</p>
              </div>
              <div className="rounded-2xl bg-mist/70 px-2 py-3 text-center">
                <p className="truncate text-sm font-bold leading-none text-ink" title={getPropertyTypeLabel(listing.propertyType, locale)}>
                  {getPropertyTypeLabel(listing.propertyType, locale)}
                </p>
                <p className="mt-1.5 text-[11px] font-medium text-ink/50">{t.common.propertyType}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-700">
                {t.common.adminReviewed}
              </span>
              {listing.userId ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                  {t.common.verifiedOwner}
                </span>
              ) : null}
              {hasNoAgencyFee ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
                  {t.common.noAgencyFee}
                </span>
              ) : null}
            </div>
          </section>

          <LocationSection locale={locale} value={listing} className="border-b border-line/70 py-5" />

          <section className="space-y-4 pt-5">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                {t.common.ownerContact}
              </h2>
              <p className="mt-1 text-xs text-ink/45">
                {t.common.created}: {formatDate(listing.createdAt, locale)}
              </p>
            </div>

            {session ? (
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-mist/50 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="text-base font-semibold tabular-nums text-ink">{listing.phone}</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-4 text-sm leading-6 text-ink/70">
                {t.listingDetail.revealContact}
              </div>
            )}

            <div className="space-y-2.5">
              {session ? (
                <a href={contactHref} className="btn-primary w-full gap-2">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {t.common.contactOwner}
                </a>
              ) : (
                <Link href={loginToContactHref} className="btn-primary w-full">
                  {t.common.logInToContact}
                </Link>
              )}

              {canMessageOwner ? (
                session ? (
                  <form action="/api/conversations" method="post">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button type="submit" className="btn-secondary w-full gap-2">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      {t.common.messageOwner}
                    </button>
                  </form>
                ) : (
                  <Link href={loginToContactHref} className="btn-secondary w-full gap-2 text-center">
                    {t.common.logInToMessage}
                  </Link>
                )
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
