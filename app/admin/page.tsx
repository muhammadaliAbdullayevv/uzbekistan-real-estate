export { privatePageMetadata as metadata } from "@/lib/site";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { EmptyState } from "@/components/empty-state";
import { PendingListingsManager } from "@/components/pending-listings-manager";
import {
  formatDate,
  formatPrice,
  getListingTypeLabel,
  getRentTypeLabel
} from "@/lib/format";
import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import { formatLocationSummary } from "@/lib/locations";
import {
  countActiveListings,
  countPendingListings,
  getPendingListings
} from "@/lib/listings";
import { isOwner } from "@/lib/owner";
import { countUsersByStatus, searchUsersByEmail } from "@/lib/user-data";
import { requireOwnerSession } from "@/lib/session-auth";

export const dynamic = "force-dynamic";

const PENDING_PAGE_SIZE = 10;

type OwnerPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildAdminHref(page: number, userQuery: string) {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set("page", String(page));
  }
  if (userQuery) {
    params.set("user", userQuery);
  }
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3"
          : "rounded-2xl border border-line/70 bg-mist/60 px-4 py-3"
      }
    >
      <p className={accent ? "text-2xl font-semibold text-accent" : "text-2xl font-semibold text-ink"}>
        {value}
      </p>
      <p className="text-xs text-ink/60">{label}</p>
    </div>
  );
}

export default async function OwnerPage({ searchParams = {} }: OwnerPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  await requireOwnerSession();

  const userQuery = getFirstParam(searchParams.user)?.trim() ?? "";
  const userNotice = getFirstParam(searchParams.userNotice) ?? "";
  const userError = getFirstParam(searchParams.userError) ?? "";
  const seeded = getFirstParam(searchParams.seeded) === "1";
  const seedError = getFirstParam(searchParams.seedError) === "1";
  const page = Math.max(1, Number.parseInt(getFirstParam(searchParams.page) ?? "1", 10) || 1);

  const [pendingListings, totalPending, users, activeListingsCount, userStats] = await Promise.all([
    getPendingListings({ limit: PENDING_PAGE_SIZE, offset: (page - 1) * PENDING_PAGE_SIZE }),
    countPendingListings(),
    userQuery ? searchUsersByEmail(userQuery) : Promise.resolve([]),
    countActiveListings(),
    countUsersByStatus()
  ]);

  const totalPendingPages = Math.max(1, Math.ceil(totalPending / PENDING_PAGE_SIZE));
  const showMoreUsersHint = users.length === 20;

  const pendingListingItems = pendingListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    priceLabel: formatPrice(
      listing.price,
      listing.currency,
      listing.listingType,
      listing.rentType,
      locale
    ),
    listingTypeLabel: getListingTypeLabel(listing.listingType, locale),
    rentTypeLabel:
      listing.listingType === "rent" && listing.rentType
        ? getRentTypeLabel(listing.rentType, locale)
        : null,
    locationSummary: formatLocationSummary(listing, locale),
    rooms: listing.rooms,
    area: listing.area,
    createdLabel: formatDate(listing.createdAt, locale),
    address: listing.address,
    latitude: listing.latitude,
    longitude: listing.longitude,
    images: listing.images.map((image) => ({ id: image.id, url: image.url }))
  }));

  return (
    <div className="shell space-y-8">
      <section className="flex flex-col gap-6 rounded-[32px] border bg-white/85 px-6 py-8 shadow-soft sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="pill border-accent/25 bg-accent/5 text-accent">
              {t.owner.dashboardPill}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ink">{t.owner.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70">{t.owner.intro}</p>
          </div>

          <form action="/api/auth/logout" method="post">
            <input type="hidden" name="next" value="/login" />
            <button type="submit" className="btn-secondary">
              {t.common.signOut}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-4">
          <StatCard label={t.owner.statsPending} value={totalPending} accent />
          <StatCard label={t.owner.statsActive} value={activeListingsCount} />
          <StatCard label={t.owner.statsUsers} value={userStats.total} />
          <StatCard label={t.owner.statsBlocked} value={userStats.blocked} />
        </div>
      </section>

      {pendingListingItems.length === 0 ? (
        <EmptyState
          eyebrow={t.common.noResults}
          title={t.owner.emptyTitle}
          description={t.owner.emptyDescription}
        />
      ) : (
        <>
          <PendingListingsManager
            listings={pendingListingItems}
            copy={{
              pendingStatusLabel: t.enums.listingStatuses.PENDING,
              approve: t.owner.approve,
              reject: t.owner.reject,
              rejectConfirm: t.owner.rejectConfirm,
              locationLabel: t.common.location,
              roomsLabel: t.common.rooms,
              areaLabel: t.common.area,
              createdLabel: t.common.created,
              exactAddress: t.owner.exactAddress,
              viewOnMap: t.owner.viewOnMap,
              viewListing: t.owner.viewListing,
              selectAll: t.owner.selectAll,
              selectedCount: t.owner.selectedCount,
              bulkApprove: t.owner.bulkApprove,
              bulkReject: t.owner.bulkReject,
              bulkApproveConfirm: t.owner.bulkApproveConfirm,
              bulkRejectConfirm: t.owner.bulkRejectConfirm
            }}
          />

          {totalPendingPages > 1 ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              {page > 1 ? (
                <Link href={buildAdminHref(page - 1, userQuery)} className="btn-secondary">
                  {t.owner.paginationPrev}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-ink/60">
                {formatMessage(t.owner.paginationPage, { current: page, total: totalPendingPages })}
              </span>
              {page < totalPendingPages ? (
                <Link href={buildAdminHref(page + 1, userQuery)} className="btn-secondary">
                  {t.owner.paginationNext}
                </Link>
              ) : (
                <span />
              )}
            </div>
          ) : null}
        </>
      )}

      <section className="panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="pill border-accent/25 bg-accent/5 text-accent">
            {t.owner.controlsPill}
          </span>
          <h2 className="font-display text-3xl font-semibold text-ink">{t.owner.manageUsers}</h2>
          <p className="max-w-3xl text-base leading-7 text-ink/70">{t.owner.manageUsersIntro}</p>
        </div>

        {userNotice === "updated" ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
            {t.owner.userUpdated}
          </div>
        ) : null}

        {userError === "owner-protected" ? (
          <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {t.owner.ownerProtected}
          </div>
        ) : null}

        {userError === "invalid-action" ? (
          <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {t.owner.invalidAction}
          </div>
        ) : null}

        {userError === "not-found" ? (
          <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {t.owner.notFound}
          </div>
        ) : null}

        <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="search"
            name="user"
            defaultValue={userQuery}
            className="input"
            placeholder={t.owner.searchPlaceholder}
          />
          <button type="submit" className="btn-primary">
            {t.owner.searchButton}
          </button>
        </form>

        {!userQuery ? (
          <div className="rounded-[24px] border border-line bg-mist/70 px-5 py-4 text-sm leading-7 text-ink/65">
            {t.owner.searchHint}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            eyebrow={t.common.noResults}
            title={t.owner.noUsersTitle}
            description={t.owner.noUsersDescription}
          />
        ) : (
          <div className="grid gap-4">
            {users.map((user) => {
              const ownerAccount = isOwner(user);

              return (
                <article
                  key={user.id}
                  className="rounded-[28px] border border-line/80 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="pill border-accent/25 bg-accent/5 text-accent">
                          {t.enums.userStatuses[user.status]}
                        </span>
                        {ownerAccount ? (
                          <span className="pill border-line bg-mist text-ink/70">
                            {t.common.owner}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-ink">
                          {user.name ?? user.email}
                        </h3>
                        <p className="mt-1 text-sm text-ink/65">{user.email}</p>
                      </div>
                      <p className="text-sm text-ink/60">
                        {t.owner.joined} {formatDate(user.createdAt, locale)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:min-w-[260px]">
                      {ownerAccount ? (
                        <div className="rounded-2xl border border-line bg-mist/70 px-4 py-3 text-sm text-ink/65">
                          {t.owner.ownerProtectedText}
                        </div>
                      ) : (
                        <form action={`/api/admin/users/${user.id}`} method="post">
                          <input
                            type="hidden"
                            name="action"
                            value={user.status === "BLOCKED" ? "UNBLOCK" : "BLOCK"}
                          />
                          <input type="hidden" name="search" value={userQuery} />
                          {user.status === "BLOCKED" ? (
                            <button type="submit" className="btn-secondary w-full">
                              {t.owner.unblockUser}
                            </button>
                          ) : (
                            <ConfirmSubmitButton
                              confirmMessage={t.owner.blockConfirm}
                              className="btn-primary w-full"
                            >
                              {t.owner.blockUser}
                            </ConfirmSubmitButton>
                          )}
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {showMoreUsersHint ? (
              <p className="text-sm text-ink/60">{t.owner.moreResultsHint}</p>
            ) : null}
          </div>
        )}
      </section>

      {process.env.NODE_ENV !== "production" ? (
        <section className="panel space-y-4 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {t.owner.seedDemoDataTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">
              {t.owner.seedDemoDataDescription}
            </p>
          </div>

          {seeded ? (
            <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
              {t.owner.seedDemoDataSuccess}
            </div>
          ) : null}

          {seedError ? (
            <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
              {t.owner.seedDemoDataError}
            </div>
          ) : null}

          <form action="/api/admin/seed-demo-listings" method="post">
            <button type="submit" className="btn-primary">
              {t.owner.seedDemoDataButton}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
