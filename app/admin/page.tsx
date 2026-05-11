export { privatePageMetadata as metadata } from "@/lib/site";
import { EmptyState } from "@/components/empty-state";
import { PropertyImage } from "@/components/property-image";
import {
  formatDate,
  formatPrice,
  getListingTypeLabel,
  getRentTypeLabel
} from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
import { formatLocationSummary } from "@/lib/locations";
import { getPendingListings } from "@/lib/listings";
import { isOwner } from "@/lib/owner";
import { searchUsersByEmail } from "@/lib/user-data";
import { requireOwnerSession } from "@/lib/session-auth";

export const dynamic = "force-dynamic";

type OwnerPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OwnerPage({ searchParams = {} }: OwnerPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  await requireOwnerSession();

  const userQuery = getFirstParam(searchParams.user)?.trim() ?? "";
  const userNotice = getFirstParam(searchParams.userNotice) ?? "";
  const userError = getFirstParam(searchParams.userError) ?? "";

  const [pendingListings, users] = await Promise.all([
    getPendingListings(),
    userQuery ? searchUsersByEmail(userQuery) : Promise.resolve([])
  ]);

  return (
    <div className="shell space-y-8">
      <section className="flex flex-col gap-4 rounded-[32px] border bg-white/85 px-6 py-8 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:px-8">
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
      </section>

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
                          <button
                            type="submit"
                            className={
                              user.status === "BLOCKED"
                                ? "btn-secondary w-full"
                                : "btn-primary w-full"
                            }
                          >
                            {user.status === "BLOCKED"
                              ? t.owner.unblockUser
                              : t.owner.blockUser}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {pendingListings.length === 0 ? (
        <EmptyState
          eyebrow={t.common.noResults}
          title={t.owner.emptyTitle}
          description={t.owner.emptyDescription}
        />
      ) : (
        <div className="grid gap-6">
          {pendingListings.map((listing) => {
            const image = listing.images[0]?.url;

            return (
              <article key={listing.id} className="panel grid gap-6 p-5 lg:grid-cols-[300px_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border bg-mist">
                  <PropertyImage
                    src={image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="pill">{t.enums.listingStatuses.PENDING}</span>
                      <span className="pill">{getListingTypeLabel(listing.listingType, locale)}</span>
                      {listing.listingType === "rent" && listing.rentType ? (
                        <span className="pill border-accent/25 bg-accent/5 text-accent">
                          {getRentTypeLabel(listing.rentType, locale)}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-semibold text-ink">
                      {listing.title}
                    </h2>
                    <p className="mt-2 text-lg font-semibold text-ink">
                      {formatPrice(
                        listing.price,
                        listing.currency,
                        listing.listingType,
                        listing.rentType,
                        locale
                      )}
                    </p>
                  </div>

                  <p className="max-w-3xl text-sm leading-7 text-ink/70">{listing.description}</p>

                  <div className="grid gap-3 text-sm text-ink/70 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-mist px-4 py-3">
                      <strong className="mr-2 text-ink">{t.common.location}:</strong>
                      {formatLocationSummary(listing, locale)}
                    </div>
                    <div className="rounded-2xl bg-mist px-4 py-3">
                      <strong className="mr-2 text-ink">{t.common.rooms}:</strong>
                      {listing.rooms}
                    </div>
                    <div className="rounded-2xl bg-mist px-4 py-3">
                      <strong className="mr-2 text-ink">{t.common.area}:</strong>
                      {listing.area} m²
                    </div>
                    <div className="rounded-2xl bg-mist px-4 py-3">
                      <strong className="mr-2 text-ink">{t.common.created}:</strong>
                      {formatDate(listing.createdAt, locale)}
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
                        {t.owner.approve}
                      </button>
                    </form>

                    <form
                      action={`/api/admin/listings/${listing.id}/status`}
                      method="post"
                      className="flex-1"
                    >
                      <input type="hidden" name="status" value="REJECTED" />
                      <button type="submit" className="btn-secondary w-full">
                        {t.owner.reject}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
