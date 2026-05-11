import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { SearchFilters } from "@/components/search-filters";
import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import {
  getApprovedListings,
  getFavoriteListingIds,
  getFirstParam,
  type ListingSearchParams
} from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams = {} }: HomePageProps) {
  const session = await getUserSession();
  const locale = getLocale();
  const t = getTranslations(locale);
  const filters: ListingSearchParams = {
    q: getFirstParam(searchParams.q),
    listingType: getFirstParam(searchParams.listingType),
    region: getFirstParam(searchParams.region),
    district: getFirstParam(searchParams.district),
    minPrice: getFirstParam(searchParams.minPrice),
    maxPrice: getFirstParam(searchParams.maxPrice),
    rooms: getFirstParam(searchParams.rooms),
    propertyType: getFirstParam(searchParams.propertyType),
    currency: getFirstParam(searchParams.currency),
    sort: getFirstParam(searchParams.sort) ?? "newest"
  };

  const [listings, favoriteIds] = await Promise.all([
    getApprovedListings(filters),
    session ? getFavoriteListingIds(session.userId) : Promise.resolve(new Set<string>())
  ]);

  return (
    <div className="shell space-y-3 sm:space-y-4">
      <section className="rounded-[24px] border border-line/70 bg-white px-4 py-4 shadow-soft sm:rounded-[28px] sm:px-7 sm:py-6">
        <h1 className="max-w-3xl font-display text-[1.55rem] font-semibold leading-[1.15] text-ink sm:text-[2.1rem] md:text-[2.6rem]">
          {t.home.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/68 sm:text-base sm:leading-7">
          {t.home.subtitle}
        </p>
      </section>

      <SearchFilters locale={locale} values={filters} />

      <section className="space-y-4">
        <div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {formatMessage(t.home.resultsFound, {
                count: listings.length
              })}
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              {t.home.resultsNote}
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            eyebrow={t.common.noResults}
            title={t.home.emptyTitle}
            description={t.home.emptyDescription}
          />
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                locale={locale}
                listing={listing}
                isFavorited={favoriteIds.has(listing.id)}
                canFavorite={Boolean(session)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
