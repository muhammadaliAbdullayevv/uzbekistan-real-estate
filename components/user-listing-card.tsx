import type { ListingStatus } from "@prisma/client";
import Link from "next/link";

import { PropertyImage } from "@/components/property-image";
import { UserListingActions } from "@/components/user-listing-actions";
import {
  formatDate,
  formatPrice,
  getListingTypeLabel,
  getPropertyTypeLabel,
  getRentTypeLabel
} from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { formatLocationSummary } from "@/lib/locations";
import type {
  ListingAvailabilityStatusValue,
  ListingWithImages
} from "@/lib/listings";

type UserListingCardProps = {
  locale: Locale;
  listing: ListingWithImages;
};

const STATUS_STYLES: Record<ListingStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-coral/20 bg-coral/10 text-coral"
};

const AVAILABILITY_STYLES: Record<ListingAvailabilityStatusValue, string> = {
  ACTIVE: "border-slate-200 bg-slate-50 text-slate-700",
  RENTED: "border-sky-200 bg-sky-50 text-sky-700",
  SOLD: "border-violet-200 bg-violet-50 text-violet-700"
};

export function UserListingCard({ locale, listing }: UserListingCardProps) {
  const t = getTranslations(locale);
  const image = listing.images[0]?.url;
  const isPubliclyVisible =
    listing.status === "APPROVED" && listing.availabilityStatus === "ACTIVE";
  const isOffMarket =
    listing.status === "APPROVED" && listing.availabilityStatus !== "ACTIVE";

  return (
    <article className="panel overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <PropertyImage
          src={image}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className={`pill ${STATUS_STYLES[listing.status]}`}>
            {t.enums.listingStatuses[listing.status]}
          </span>
          <span className={`pill ${AVAILABILITY_STYLES[listing.availabilityStatus]}`}>
            {t.enums.listingAvailabilityStatuses[listing.availabilityStatus]}
          </span>
          <span className="pill">{getListingTypeLabel(listing.listingType, locale)}</span>
          <span className="pill">{getPropertyTypeLabel(listing.propertyType, locale)}</span>
          {listing.listingType === "rent" && listing.rentType ? (
            <span className="pill border-accent/25 bg-accent/5 text-accent">
              {getRentTypeLabel(listing.rentType, locale)}
            </span>
          ) : null}
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight text-ink">
            {listing.title}
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            {formatLocationSummary(listing, locale)} • {t.userListingCard.createdPrefix}{" "}
            {formatDate(listing.createdAt, locale)}
          </p>
        </div>

        <p className="text-2xl font-semibold text-ink">
          {formatPrice(
            listing.price,
            listing.currency,
            listing.listingType,
            listing.rentType,
            locale
          )}
        </p>

        <div className="grid grid-cols-3 gap-2 text-sm text-ink/70">
          <div className="rounded-2xl bg-mist px-3 py-2">
            {listing.rooms} {t.common.roomsShort}
          </div>
          <div className="rounded-2xl bg-mist px-3 py-2">{listing.area} m²</div>
          <div className="rounded-2xl bg-mist px-3 py-2">{listing.currency}</div>
        </div>

        <div className="rounded-[24px] border border-line bg-mist/80 px-4 py-3 text-sm leading-6 text-ink/65">
          {isOffMarket
            ? t.userListingCard.offMarketStatusCopy
            : t.userListingCard.statusCopy[listing.status]}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isPubliclyVisible ? (
            <Link href={`/listings/${listing.id}`} className="btn-secondary flex-1">
              {t.userListingCard.viewPublicPage}
            </Link>
          ) : (
            <div className="btn-secondary flex-1 cursor-default border-dashed text-ink/55 hover:border-line hover:text-ink/55">
              {isOffMarket
                ? t.userListingCard.offMarketPublicLink
                : t.userListingCard.awaitingPublicLink}
            </div>
          )}
        </div>

        <UserListingActions
          listingId={listing.id}
          listingType={listing.listingType}
          availabilityStatus={listing.availabilityStatus}
          copy={{
            edit: t.userListingCard.edit,
            delete: t.userListingCard.delete,
            deleting: t.userListingCard.deleting,
            markRented: t.userListingCard.markRented,
            markSold: t.userListingCard.markSold,
            markActive: t.userListingCard.markActive,
            updating: t.userListingCard.updating,
            deleteConfirm: t.userListingCard.deleteConfirm,
            markRentedConfirm: t.userListingCard.markRentedConfirm,
            markSoldConfirm: t.userListingCard.markSoldConfirm,
            markActiveConfirm: t.userListingCard.markActiveConfirm
          }}
        />
      </div>
    </article>
  );
}
