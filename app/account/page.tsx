import Link from "next/link";

export { privatePageMetadata as metadata } from "@/lib/site";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { formatDate, formatDisplayName } from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
import {
  getFavoriteListingIds,
  getFavoriteListingsForUser,
  getRecentViewedListingsForUser
} from "@/lib/listings";
import { requireUser } from "@/lib/session-auth";

export default async function AccountPage() {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await requireUser("/account");

  const [favorites, recentViews, favoriteIds] = await Promise.all([
    getFavoriteListingsForUser(user.id),
    getRecentViewedListingsForUser(user.id),
    getFavoriteListingIds(user.id)
  ]);

  const displayName = user.name ? formatDisplayName(user.name) : user.email;

  return (
    <div className="shell space-y-10">
      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="panel space-y-6 p-6 sm:p-8">
          <span className="pill border-accent/25 bg-accent/5 text-accent">{t.account.pill}</span>
          <h1 className="font-display text-4xl font-semibold text-ink">
            {displayName}
          </h1>
          <p className="text-base leading-7 text-ink/70">{t.account.intro}</p>
          {!user.emailVerifiedAt ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              {t.account.emailNotVerified}
            </div>
          ) : null}
          <div className="space-y-3 rounded-[24px] bg-mist p-5 text-sm leading-7 text-ink/70">
            <p>
              {t.account.loggedInAs} <strong className="text-ink">{user.email}</strong>
            </p>
            {user.phone ? (
              <p>
                {t.account.phone}: <strong className="text-ink">{user.phone}</strong>
              </p>
            ) : null}
            <p className="text-ink/65">
              {t.account.memberSince}{" "}
              <strong className="text-ink">{formatDate(user.createdAt, locale)}</strong>
            </p>
          </div>

          <section className="space-y-3 rounded-[24px] border border-line/80 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.account.quickActions}
              </p>
            </div>
            <div className="grid gap-3">
              <Link href="/add-listing" className="btn-primary w-full text-center">
                {t.account.submitListing}
              </Link>
              <Link href="/my-listings" className="btn-secondary w-full text-center">
                {t.account.trackListings}
              </Link>
              <Link href="/favorites" className="btn-secondary w-full text-center">
                {t.account.openFavorites}
              </Link>
            </div>
          </section>

          <section className="space-y-3 rounded-[24px] border border-line/80 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.account.security}
              </p>
            </div>
            <div className="grid gap-3">
              <Link href="/account/sessions" className="btn-secondary w-full text-center">
                {t.account.manageSessions}
              </Link>
              <form action="/api/auth/logout" method="post">
                <input type="hidden" name="next" value="/" />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  {t.common.signOut}
                </button>
              </form>
            </div>
          </section>
        </div>

        <section className="panel space-y-6 p-6 sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
              {t.account.overview}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              {t.account.overviewTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/62">
              {t.account.overviewDescription}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[26px] border border-line/80 bg-mist/45 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.account.trackListings}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                {t.account.myListingsTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {t.account.myListingsDescription}
              </p>
              <Link href="/my-listings" className="btn-secondary mt-5 w-full text-center">
                {t.account.trackListings}
              </Link>
            </article>

            <article className="rounded-[26px] border border-line/80 bg-mist/45 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.account.savedListings}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                {t.account.savedTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {t.account.savedListingsDescription}
              </p>
              <Link href="/favorites" className="btn-secondary mt-5 w-full text-center">
                {t.account.openFavorites}
              </Link>
            </article>

            <article className="rounded-[26px] border border-line/80 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.account.recentlyViewed}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                {t.account.recentTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {t.account.recentlyViewedDescription}
              </p>
            </article>

            <article className="rounded-[26px] border border-line/80 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
                {t.account.manageSessions}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                {t.account.securityTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                {t.account.securityDescription}
              </p>
              <Link href="/account/sessions" className="btn-secondary mt-5 w-full text-center">
                {t.account.manageSessions}
              </Link>
            </article>
          </div>
        </section>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.account.favorites}</p>
          <h2 className="font-display text-3xl font-semibold text-ink">
            {t.account.savedListings}
          </h2>
        </div>

        {favorites.length === 0 ? (
          <EmptyState
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            }
            title={t.account.noFavoritesTitle}
            description={t.account.noFavorites}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((listing) => (
              <ListingCard
                key={listing.id}
                locale={locale}
                listing={listing}
                isFavorited={favoriteIds.has(listing.id)}
                canFavorite
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">
            {t.account.recentActivity}
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink">
            {t.account.recentlyViewed}
          </h2>
        </div>

        {recentViews.length === 0 ? (
          <EmptyState
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
            title={t.account.noRecentViewsTitle}
            description={t.account.noRecentViews}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentViews.map((listing) => (
              <ListingCard
                key={listing.id}
                locale={locale}
                listing={listing}
                isFavorited={favoriteIds.has(listing.id)}
                canFavorite
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
