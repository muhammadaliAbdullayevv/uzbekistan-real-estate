import Link from "next/link";
import { redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getFavoriteListingIds, getFavoriteListingsForUser } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();

  if (!session) {
    redirect("/login?next=/favorites");
  }

  const [favorites, favoriteIds] = await Promise.all([
    getFavoriteListingsForUser(session.userId),
    getFavoriteListingIds(session.userId)
  ]);

  return (
    <div className="shell space-y-8">
      <section className="panel flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="pill border-accent/25 bg-accent/5 text-accent">
            {t.favoritesPage.pill}
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-ink">
            {t.favoritesPage.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70">{t.favoritesPage.intro}</p>
        </div>
        <Link href="/" className="btn-secondary">
          {t.favoritesPage.browseMore}
        </Link>
      </section>

      {favorites.length === 0 ? (
        <EmptyState
          eyebrow={t.common.noResults}
          title={t.favoritesPage.emptyTitle}
          description={t.favoritesPage.emptyDescription}
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
    </div>
  );
}
