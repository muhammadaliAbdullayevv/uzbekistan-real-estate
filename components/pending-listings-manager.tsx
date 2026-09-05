"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PropertyImage } from "@/components/property-image";
import { formatMessage } from "@/lib/format-message";

export type PendingListingItem = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  listingTypeLabel: string;
  rentTypeLabel: string | null;
  locationSummary: string;
  rooms: number;
  area: number;
  createdLabel: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  images: { id: string; url: string }[];
};

type PendingListingsManagerProps = {
  listings: PendingListingItem[];
  copy: {
    pendingStatusLabel: string;
    approve: string;
    reject: string;
    rejectConfirm: string;
    locationLabel: string;
    roomsLabel: string;
    areaLabel: string;
    createdLabel: string;
    exactAddress: string;
    viewOnMap: string;
    viewListing: string;
    selectAll: string;
    selectedCount: string;
    bulkApprove: string;
    bulkReject: string;
    bulkApproveConfirm: string;
    bulkRejectConfirm: string;
  };
};

export function PendingListingsManager({ listings, copy }: PendingListingsManagerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) =>
      current.size === listings.length ? new Set() : new Set(listings.map((listing) => listing.id))
    );
  }

  async function bulkAction(status: "APPROVED" | "REJECTED") {
    const confirmMessage = formatMessage(
      status === "APPROVED" ? copy.bulkApproveConfirm : copy.bulkRejectConfirm,
      { count: selected.size }
    );

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/listings/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], status })
      });

      if (response.ok) {
        setSelected(new Set());
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-white px-4 py-3 text-sm">
        <label className="flex items-center gap-2 text-ink/70">
          <input
            type="checkbox"
            checked={listings.length > 0 && selected.size === listings.length}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-line accent-accent"
          />
          {copy.selectAll}
        </label>

        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink/60">{formatMessage(copy.selectedCount, { count: selected.size })}</span>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => bulkAction("APPROVED")}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.bulkApprove}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => bulkAction("REJECTED")}
              className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink/70 transition hover:border-ink/25 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.bulkReject}
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6">
        {listings.map((listing) => {
          const [mainImage, ...restImages] = listing.images;
          const hasCoordinates = listing.latitude !== null && listing.longitude !== null;

          return (
            <article key={listing.id} className="panel grid gap-6 p-5 lg:grid-cols-[auto_300px_1fr]">
              <label className="flex items-start justify-center pt-1 lg:pt-2">
                <input
                  type="checkbox"
                  checked={selected.has(listing.id)}
                  onChange={() => toggle(listing.id)}
                  className="h-5 w-5 rounded border-line accent-accent"
                />
              </label>

              <div className="space-y-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border bg-mist">
                  <PropertyImage
                    src={mainImage?.url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                </div>

                {restImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {restImages.map((image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-lg border bg-mist"
                      >
                        <PropertyImage
                          src={image.url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="pill">{copy.pendingStatusLabel}</span>
                    <span className="pill">{listing.listingTypeLabel}</span>
                    {listing.rentTypeLabel ? (
                      <span className="pill border-accent/25 bg-accent/5 text-accent">
                        {listing.rentTypeLabel}
                      </span>
                    ) : null}
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="ml-auto text-sm font-semibold text-accent hover:underline"
                    >
                      {copy.viewListing}
                    </Link>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold text-ink">{listing.title}</h2>
                  <p className="mt-2 text-lg font-semibold text-ink">{listing.priceLabel}</p>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-ink/70">{listing.description}</p>

                <div className="grid gap-3 text-sm text-ink/70 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-mist px-4 py-3">
                    <strong className="mr-2 text-ink">{copy.locationLabel}:</strong>
                    {listing.locationSummary}
                  </div>
                  <div className="rounded-2xl bg-mist px-4 py-3">
                    <strong className="mr-2 text-ink">{copy.roomsLabel}:</strong>
                    {listing.rooms}
                  </div>
                  <div className="rounded-2xl bg-mist px-4 py-3">
                    <strong className="mr-2 text-ink">{copy.areaLabel}:</strong>
                    {listing.area} m²
                  </div>
                  <div className="rounded-2xl bg-mist px-4 py-3">
                    <strong className="mr-2 text-ink">{copy.createdLabel}:</strong>
                    {listing.createdLabel}
                  </div>
                  <div className="rounded-2xl bg-mist px-4 py-3 md:col-span-2 xl:col-span-4">
                    <strong className="mr-2 text-ink">{copy.exactAddress}:</strong>
                    {listing.address}
                    {hasCoordinates ? (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-accent hover:underline"
                        >
                          {copy.viewOnMap}
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <form
                    action={`/api/admin/listings/${listing.id}/status`}
                    method="post"
                    className="flex-1"
                  >
                    <input type="hidden" name="status" value="APPROVED" />
                    <button type="submit" className="btn-primary w-full">
                      {copy.approve}
                    </button>
                  </form>

                  <form
                    action={`/api/admin/listings/${listing.id}/status`}
                    method="post"
                    className="flex-1"
                  >
                    <input type="hidden" name="status" value="REJECTED" />
                    <ConfirmSubmitButton confirmMessage={copy.rejectConfirm} className="btn-secondary w-full">
                      {copy.reject}
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
