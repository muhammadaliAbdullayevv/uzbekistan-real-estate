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
          className="group flex items-center justify-between gap-4 rounded-[24px] border border-cyan-500/30 bg-gradient-to-r from-[#0F1A28] via-[#0D2230] to-[#0A2524] p-4 shadow-lg transition hover:border-cyan-400/60 sm:px-6"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-lg font-extrabold text-slate-950 shadow-md shadow-cyan-500/25">
              ✨
            </span>
            <div>
              <p className="text-sm font-extrabold text-white sm:text-base">
                {t.aiUychi.title}
              </p>
              <p className="text-xs text-cyan-200/80 sm:text-sm">
                {t.aiUychi.subtitle}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-3 py-1.5 text-xs font-extrabold text-cyan-300 transition group-hover:bg-cyan-400 group-hover:text-slate-950">
            &rarr;
          </span>
        </Link>
      ) : null}

      {recentListings.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-white sm:text-xl">
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
          <p className="text-sm font-bold text-slate-300 sm:text-base">
            <span className="font-display text-lg font-extrabold text-cyan-400 sm:text-xl">
              {totalCount}
            </span>{" "}
            {t.home.resultsCountSuffix}
          </p>
          <p className="text-xs font-medium text-slate-400">
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
