import { notFound } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { BackIconButton } from "@/components/back-icon-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ListingGallery } from "@/components/listing-gallery";
import { LocationSection, LocationSummary } from "@/components/location-display";
import {
  formatDate,
  formatPrice,
  getPropertyTypeLabel,
  getRentTypeLabel
} from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getListingByIdForOwner } from "@/lib/listings";
import { requireOwnerSession } from "@/lib/session-auth";

export const dynamic = "force-dynamic";

type AdminListingPreviewPageProps = {
  params: {
    id: string;
  };
};

export default async function AdminListingPreviewPage({ params }: AdminListingPreviewPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  await requireOwnerSession();

  const listing = await getListingByIdForOwner(params.id);

  if (!listing) {
    notFound();
  }

  const listingIndicator =
    listing.listingType === "sale" ? t.common.forSaleIndicator : t.common.forRentIndicator;
  const listingIndicatorClass =
    listing.listingType === "sale"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  const hasCoordinates = listing.latitude !== null && listing.longitude !== null;

  return (
    <div className="shell space-y-8">
      <BackIconButton href="/admin" label={t.owner.backToDashboard} />

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

        <aside className="panel h-fit space-y-0 p-5 sm:p-7">
          <div className="border-b border-line/70 pb-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="pill">{t.enums.listingStatuses[listing.status]}</span>
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
            <LocationSummary locale={locale} value={listing} className="mt-1.5 text-sm text-ink/60" />
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
                <p
                  className="truncate text-sm font-bold leading-none text-ink"
                  title={getPropertyTypeLabel(listing.propertyType, locale)}
                >
                  {getPropertyTypeLabel(listing.propertyType, locale)}
                </p>
                <p className="mt-1.5 text-[11px] font-medium text-ink/50">{t.common.propertyType}</p>
              </div>
            </div>
          </section>

          <LocationSection locale={locale} value={listing} className="border-b border-line/70 py-5" />

          {hasCoordinates ? (
            <div className="border-b border-line/70 py-4">
              <a
                href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-accent hover:underline"
              >
                {t.owner.viewOnMap}
              </a>
            </div>
          ) : null}

          <section className="space-y-4 pt-5">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                {t.common.ownerContact}
              </h2>
              <p className="mt-1 text-xs text-ink/45">
                {t.common.created}: {formatDate(listing.createdAt, locale)}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-line bg-mist/50 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span className="text-base font-semibold tabular-nums text-ink">{listing.phone}</span>
            </div>

            {listing.status === "PENDING" ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                <form action={`/api/admin/listings/${listing.id}/status`} method="post">
                  <input type="hidden" name="status" value="APPROVED" />
                  <button type="submit" className="btn-primary w-full">
                    {t.owner.approve}
                  </button>
                </form>
                <form action={`/api/admin/listings/${listing.id}/status`} method="post">
                  <input type="hidden" name="status" value="REJECTED" />
                  <ConfirmSubmitButton confirmMessage={t.owner.rejectConfirm} className="btn-secondary w-full">
                    {t.owner.reject}
                  </ConfirmSubmitButton>
                </form>
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
