import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { SearchFilters } from "@/components/search-filters";
import { getFavoriteListingIds, getVisitorId } from "@/lib/favorites";
import { hasGeminiConfig } from "@/lib/gemini";
import { getLocale, getTranslations } from "@/lib/i18n";
import {
  countApprovedListings,
  getApprovedListings,
  getFirstParam,
  type ListingSearchParams
} from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

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
    rentType: getFirstParam(searchParams.rentType),
    furnishing: getFirstParam(searchParams.furnishing),
    verifiedOnly: getFirstParam(searchParams.verifiedOnly),
    currency: getFirstParam(searchParams.currency),
    sort: rawSort ?? "newest",
    nearLat: getFirstParam(searchParams.nearLat),
    nearLng: getFirstParam(searchParams.nearLng)
  };

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.listingType ||
      filters.region ||
      filters.district ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.rooms ||
      filters.propertyType ||
      filters.rentType ||
      filters.furnishing ||
      filters.verifiedOnly ||
      filters.currency ||
      filters.nearLat ||
      filters.nearLng ||
      (rawSort && rawSort !== "newest")
  );

  const session = await getUserSession();
  const visitorId = getVisitorId();

  const [totalCount, listings, recentListings, favoriteIds] = await Promise.all([
    countApprovedListings(filters),
    getApprovedListings(filters),
    hasActiveFilters
      ? Promise.resolve([])
      : getApprovedListings({ sort: "newest", limit: RECENTLY_ADDED_LIMIT }),
    getFavoriteListingIds(visitorId, session?.userId ?? null)
  ]);

  return (
    <div className="shell space-y-5 sm:space-y-6">
      <SearchFilters locale={locale} values={filters} />

      {/* Ambient AI Concierge Teaser Banner */}
      {hasGeminiConfig() ? (
        <Link
          href="/ai-uychi"
          className="group flex items-center justify-between gap-4 rounded-[22px] border border-blue-200/90 bg-gradient-to-r from-white via-[#EFF6FF] to-blue-50/90 p-3.5 shadow-[0_6px_18px_-6px_rgba(37,99,235,0.1)] transition hover:border-blue-400 sm:rounded-[24px] sm:px-6 sm:py-4"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white shadow-md shadow-blue-600/20 sm:h-11 sm:w-11">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3Z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-900 sm:text-base">
                {t.aiUychi.title}
              </p>
              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                {t.aiUychi.subtitle}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-extrabold text-blue-600 shadow-xs transition group-hover:bg-blue-600 group-hover:text-white">
            &rarr;
          </span>
        </Link>
      ) : null}

      {recentListings.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-slate-900 sm:text-xl">
              {t.home.recentlyAddedTitle}
            </h2>
          </div>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 sm:gap-4">
            {recentListings.map((listing) => (
              <div
                key={listing.id}
                className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[310px]"
              >
                <ListingCard
                  locale={locale}
                  listing={listing}
                  isFavorited={favoriteIds.has(listing.id)}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
          <p className="text-sm font-bold text-slate-700 sm:text-base">
            <span className="font-display text-lg font-extrabold text-blue-600 sm:text-xl">
              {totalCount}
            </span>{" "}
            {t.home.resultsCountSuffix}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {t.home.resultsNote}
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                locale={locale}
                listing={listing}
                isFavorited={favoriteIds.has(listing.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t.home.emptyTitle}
            description={t.home.emptyDescription}
          />
        )}
      </section>
    </div>
  );
}
