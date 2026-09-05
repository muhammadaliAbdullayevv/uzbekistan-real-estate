import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { SearchFilters } from "@/components/search-filters";
import { WelcomeGuide } from "@/components/welcome-guide";
import { getLocale, getTranslations } from "@/lib/i18n";
import {
  countApprovedListings,
  getApprovedListings,
  getFirstParam,
  type ListingSearchParams
} from "@/lib/listings";

export const dynamic = "force-dynamic";

// Size of the "recently added" swipeable teaser row shown above the full
// listing grid on the default (nothing searched yet) view.
const RECENTLY_ADDED_LIMIT = 12;

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams = {} }: HomePageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const rawSort = getFirstParam(searchParams.sort);
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
    sort: rawSort ?? "newest",
    nearLat: getFirstParam(searchParams.nearLat),
    nearLng: getFirstParam(searchParams.nearLng)
  };

  // The "recently added" teaser is a welcome-view convenience -- once the
  // user has actually searched or filtered, showing site-wide newest
  // listings above their results would just be noise.
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.listingType ||
      filters.region ||
      filters.district ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.rooms ||
      filters.propertyType ||
      filters.currency ||
      filters.nearLat ||
      filters.nearLng ||
      (rawSort && rawSort !== "newest")
  );

  const [totalCount, listings, recentListings] = await Promise.all([
    countApprovedListings(filters),
    getApprovedListings(filters),
    hasActiveFilters
      ? Promise.resolve([])
      : getApprovedListings({ sort: "newest", limit: RECENTLY_ADDED_LIMIT })
  ]);

  return (
    <div className="shell -mt-8 space-y-3 sm:space-y-4">
      <WelcomeGuide
        copy={{
          steps: [
            { title: t.home.welcomeStep1Title, body: t.home.welcomeStep1Body },
            { title: t.home.welcomeStep2Title, body: t.home.welcomeStep2Body },
            { title: t.home.welcomeStep3Title, body: t.home.welcomeStep3Body }
          ],
          next: t.home.welcomeNext,
          finish: t.home.welcomeFinish,
          profileCtaTitle: t.home.profileCtaTitle,
          profileCtaBody: t.home.profileCtaBody,
          profileCtaButton: t.home.profileCtaButton,
          profileCtaSkip: t.home.profileCtaSkip
        }}
      />

      <section className="flex items-center gap-3 rounded-b-[24px] bg-gradient-to-r from-ink to-accent px-4 py-2.5 shadow-[0_12px_30px_-16px_rgba(15,23,42,0.5)] sm:gap-4 sm:px-6 sm:py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white sm:h-9 sm:w-9">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <h1 className="text-sm font-medium leading-snug text-white sm:text-base">
          {t.home.title}
        </h1>
      </section>

      <SearchFilters locale={locale} values={filters} />

      {recentListings.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
            {t.home.recentlyAddedTitle}
          </h2>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 sm:gap-4">
            {recentListings.map((listing) => (
              <div
                key={listing.id}
                className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[300px]"
              >
                <ListingCard locale={locale} listing={listing} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="flex flex-wrap items-baseline gap-2">
            <span className="font-sans text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
              {totalCount}
            </span>
            <span className="font-display text-xl font-normal text-ink/60 sm:text-2xl">
              {t.home.resultsCountSuffix}
            </span>
          </h2>
          <p className="mt-2 text-sm text-ink/60">{t.home.resultsNote}</p>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            eyebrow={t.common.noResults}
            title={t.home.emptyTitle}
            description={t.home.emptyDescription}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} locale={locale} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
