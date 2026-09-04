import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { SearchFilters } from "@/components/search-filters";
import { WelcomeGuide } from "@/components/welcome-guide";
import { getLocale, getTranslations } from "@/lib/i18n";
import {
  getApprovedListings,
  getFirstParam,
  type ListingSearchParams
} from "@/lib/listings";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams = {} }: HomePageProps) {
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
    sort: getFirstParam(searchParams.sort) ?? "newest",
    nearLat: getFirstParam(searchParams.nearLat),
    nearLng: getFirstParam(searchParams.nearLng)
  };

  const listings = await getApprovedListings(filters);

  return (
    <div className="shell space-y-3 sm:space-y-4">
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

      <section className="surface-dark rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5">
        <h1 className="max-w-xl font-display text-sm font-medium leading-snug text-white sm:text-base">
          {t.home.title}
        </h1>
      </section>

      <SearchFilters locale={locale} values={filters} />

      <section className="space-y-4">
        <div>
          <h2 className="flex flex-wrap items-baseline gap-2">
            <span className="font-sans text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
              {listings.length}
            </span>
            <span className="font-display text-xl font-normal text-ink/60 sm:text-2xl">
              {t.home.resultsCountSuffix}
            </span>
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            {t.home.resultsNote}
          </p>
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
