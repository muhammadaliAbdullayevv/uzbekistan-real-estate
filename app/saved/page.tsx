import Link from "next/link";

export { privatePageMetadata as metadata } from "@/lib/site";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { getVisitorId, getFavoriteListings } from "@/lib/favorites";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();
  const visitorId = getVisitorId();

  const favorites = await getFavoriteListings(visitorId, session?.userId ?? null);

  return (
    <div className="shell space-y-8">
      <section className="panel flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <span className="pill border-accent/25 bg-accent/5 text-accent">
            {t.savedPage.pill}
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t.savedPage.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70">{t.savedPage.intro}</p>
        </div>
        <Link href="/" className="btn-secondary">
          {t.savedPage.browseMore}
        </Link>
      </section>

      {favorites.length === 0 ? (
        <EmptyState
          eyebrow={t.common.noResults}
          title={t.savedPage.emptyTitle}
          description={t.savedPage.emptyDescription}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((listing) => (
            <ListingCard key={listing.id} locale={locale} listing={listing} isFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
