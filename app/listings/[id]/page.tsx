import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/favorite-button";
import { ListingGallery } from "@/components/listing-gallery";
import { LocationSection, LocationSummary } from "@/components/location-display";
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
import { getApprovedListingById, isListingFavorited } from "@/lib/listings";
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

  const favorited = session ? await isListingFavorited(session.userId, listing.id) : false;
  const loginToContactHref = `/login?next=${encodeURIComponent(`/listings/${listing.id}#contact-panel`)}`;
  const contactHref = `tel:${listing.phone}`;
  const hasNoAgencyFee =
    listing.title.toLowerCase().includes("no agency fee") ||
    listing.description.toLowerCase().includes("no agency fee");

  return (
    <div className="shell space-y-8">
      <TrackListingView listingId={listing.id} enabled={Boolean(session)} />

      <Link href="/" className="inline-flex items-center text-sm font-medium text-accent">
        {t.common.backToListings}
      </Link>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_420px]">
        <div className="space-y-6">
          <ListingGallery images={listing.images.map((image) => image.url)} title={listing.title} />

          <section className="panel space-y-6 p-6 sm:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.common.overview}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
                {t.common.fullDescription}
              </h2>
            </div>
            <p className="max-w-4xl whitespace-pre-line text-base leading-8 text-ink/75">
              {listing.description}
            </p>
          </section>
        </div>

        <aside id="contact-panel" className="panel h-fit space-y-0 p-6 sm:p-7">
          <div className="border-b border-line/70 pb-6">
            <div className="flex flex-wrap gap-2">
              <span className="pill">{getListingTypeLabel(listing.listingType, locale)}</span>
              <span className="pill border-line bg-mist text-ink/70">
                {getPropertyTypeLabel(listing.propertyType, locale)}
              </span>
              {listing.listingType === "rent" && listing.rentType ? (
                <span className="pill border-accent/25 bg-accent/5 text-accent">
                  {getRentTypeLabel(listing.rentType, locale)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink">
              {listing.title}
            </h1>
            <LocationSummary
              locale={locale}
              value={listing}
              className="mt-3 text-sm text-ink/60"
            />
            <p className="mt-4 font-display text-[2.4rem] font-semibold leading-none text-ink">
              {formatPrice(
                listing.price,
                listing.currency,
                listing.listingType,
                listing.rentType,
                locale
              )}
            </p>
          </div>

          <section className="border-b border-line/70 py-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/45">
              {t.common.propertyInfo}
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/78">
              {listing.rooms} {t.common.roomsShort} · {listing.area} m² ·{" "}
              {getPropertyTypeLabel(listing.propertyType, locale)}
            </p>
            {listing.listingType === "rent" && listing.rentType ? (
              <p className="mt-2 text-sm text-ink/58">
                {t.common.listingType}: {getListingTypeLabel(listing.listingType, locale)} ·{" "}
                {getRentTypeLabel(listing.rentType, locale)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink/58">
                {t.common.listingType}: {getListingTypeLabel(listing.listingType, locale)}
              </p>
            )}
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

          <LocationSection locale={locale} value={listing} className="border-b border-line/70 py-6" />

          <section className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/45">
                  {t.common.ownerContact}
                </h2>
                <p className="mt-3 text-base font-medium text-ink">
                  {session ? listing.phone : t.common.logInToView}
                </p>
              </div>
              <p className="text-right text-sm text-ink/55">
                <span className="block">{t.common.created}</span>
                <span className="mt-1 block font-medium text-ink/72">
                  {formatDate(listing.createdAt, locale)}
                </span>
              </p>
            </div>

            {!session ? (
              <div className="rounded-[24px] border border-accent/20 bg-accent/5 px-4 py-4 text-sm leading-6 text-ink/70">
                {t.listingDetail.revealContact}
              </div>
            ) : null}

            <div className={`grid gap-3 ${session ? "sm:grid-cols-2" : ""}`}>
              <FavoriteButton
                listingId={listing.id}
                isFavorited={favorited}
                canFavorite={Boolean(session)}
                loginHref={`/login?next=${encodeURIComponent(`/listings/${listing.id}`)}`}
                copy={{
                  save: t.common.save,
                  saved: t.common.saved,
                  saveListing: t.common.saveListing,
                  removeFromSaved: t.common.removeFromSaved
                }}
              />
              {session ? (
                <a href={contactHref} className="btn-primary w-full">
                  {t.common.contactOwner}
                </a>
              ) : (
                <Link href={loginToContactHref} className="btn-primary w-full">
                  {t.common.logInToContact}
                </Link>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
