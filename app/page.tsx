import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { SearchFilters } from "@/components/search-filters";
import { WelcomeGuide } from "@/components/welcome-guide";
import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import {
  countApprovedListings,
  getApprovedListings,
  getFirstParam,
  type ListingSearchParams
} from "@/lib/listings";

export const dynamic = "force-dynamic";

const LISTINGS_PAGE_SIZE = 24;

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildHomeHref(page: number, searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") {
      continue;
    }
    const first = getFirstParam(value);
    if (first) {
      params.set(key, first);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function HomePage({ searchParams = {} }: HomePageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const page = Math.max(1, Number.parseInt(getFirstParam(searchParams.page) ?? "1", 10) || 1);
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

  const [listings, totalCount] = await Promise.all([
    getApprovedListings({
      ...filters,
      limit: LISTINGS_PAGE_SIZE,
      offset: (page - 1) * LISTINGS_PAGE_SIZE
    }),
    countApprovedListings(filters)
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / LISTINGS_PAGE_SIZE));

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
              {totalCount}
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
          <>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} locale={locale} listing={listing} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                {page > 1 ? (
                  <Link href={buildHomeHref(page - 1, searchParams)} className="btn-secondary">
                    {t.common.paginationPrev}
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-ink/60">
                  {formatMessage(t.common.paginationPage, { current: page, total: totalPages })}
                </span>
                {page < totalPages ? (
                  <Link href={buildHomeHref(page + 1, searchParams)} className="btn-secondary">
                    {t.common.paginationNext}
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
