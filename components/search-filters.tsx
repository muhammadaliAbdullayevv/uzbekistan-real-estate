import Link from "next/link";

import { LISTING_TYPES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { getRegionOptions } from "@/lib/locations";
import { NearMeButton } from "@/components/near-me-button";
import { SearchFilterModal } from "@/components/search-filter-modal";

type SearchFiltersProps = {
  locale: Locale;
  values: {
    q?: string;
    listingType?: string;
    region?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    rooms?: string;
    propertyType?: string;
    rentType?: string;
    furnishing?: string;
    verifiedOnly?: string;
    currency?: string;
    sort?: string;
    nearLat?: string;
    nearLng?: string;
  };
};

export function SearchFilters({ locale, values }: SearchFiltersProps) {
  const t = getTranslations(locale);
  const listingTypeOptions = [
    { value: "", label: t.search.allListingTypes },
    ...LISTING_TYPES.map((listingType) => ({
      value: listingType,
      label: t.enums.listingTypes[listingType]
    }))
  ];
  const currentListingType = values.listingType ?? "";
  const currentPropertyType = values.propertyType ?? "";
  const currentRooms = values.rooms ?? "";
  const currentRentType = currentListingType === "sale" ? "" : values.rentType ?? "";
  const currentFurnishing = values.furnishing ?? "";
  const currentCurrency = values.currency ?? "";
  const currentSort = values.sort ?? "newest";
  const isVerifiedOnly = values.verifiedOnly === "1";

  const activeFilterCount = [
    values.listingType,
    values.region,
    values.district,
    values.minPrice,
    values.maxPrice,
    values.rooms,
    values.propertyType,
    currentRentType || undefined,
    values.furnishing,
    values.verifiedOnly,
    values.nearLat,
    values.sort && values.sort !== "newest" ? values.sort : undefined
  ].filter(Boolean).length;

  const quickPills = [
    {
      label: t.search.allListingTypes,
      href: "/",
      active: !currentPropertyType && !currentListingType && !currentRentType
    },
    {
      label: t.enums.propertyTypes.flat,
      href: "/?propertyType=flat",
      active: currentPropertyType === "flat"
    },
    {
      label: locale === "ru" ? "Дом / Участок" : "Hovli / Uy",
      href: "/?propertyType=house",
      active: currentPropertyType === "house"
    },
    {
      label: t.enums.propertyTypes.room,
      href: "/?propertyType=room",
      active: currentPropertyType === "room"
    },
    {
      label: t.enums.propertyTypes.studio,
      href: "/?propertyType=studio",
      active: currentPropertyType === "studio"
    },
    {
      label: t.enums.rentTypes.daily,
      href: "/?listingType=rent&rentType=daily",
      active: currentRentType === "daily"
    },
    {
      label: t.enums.listingTypes.sale,
      href: "/?listingType=sale",
      active: currentListingType === "sale"
    }
  ];

  return (
    <div className="sticky top-0 z-30 -mx-4 -mt-2 bg-[#DCE5F2]/95 px-4 py-2.5 backdrop-blur-xl sm:static sm:mx-0 sm:mt-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none space-y-2">
      <form
        action="/"
        method="get"
        className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 pl-3.5 shadow-[0_6px_20px_-6px_rgba(15,23,42,0.07),0_2px_6px_rgba(15,23,42,0.03)] sm:p-2 sm:pl-4"
      >
        {values.nearLat && values.nearLng ? (
          <>
            <input type="hidden" name="nearLat" defaultValue={values.nearLat} />
            <input type="hidden" name="nearLng" defaultValue={values.nearLng} />
          </>
        ) : null}

        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-slate-400 sm:h-5 sm:w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <label htmlFor="q" className="sr-only">
          {t.search.searchLabel}
        </label>
        <input
          id="q"
          name="q"
          placeholder={t.search.searchPlaceholder}
          defaultValue={values.q}
          className="h-10 min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-900 placeholder:font-medium placeholder:text-slate-400/75 outline-none sm:h-11 sm:text-sm"
        />

        {/* Interactive Filter Modal Trigger & Drawer */}
        <SearchFilterModal
          locale={locale}
          activeCount={activeFilterCount}
          filterLabel={t.search.filters}
          regionOptions={getRegionOptions(locale)}
          initialValues={{
            listingType: currentListingType,
            region: values.region ?? "",
            district: values.district ?? "",
            propertyType: currentPropertyType,
            rooms: currentRooms,
            minPrice: values.minPrice ?? "",
            maxPrice: values.maxPrice ?? "",
            currency: currentCurrency,
            rentType: currentRentType,
            furnishing: currentFurnishing,
            sort: currentSort,
            verifiedOnly: isVerifiedOnly
          }}
          copy={{
            listingTypeLabel: t.common.listingType,
            listingTypeOptions,
            region: t.search.region,
            allRegions: t.search.allRegions,
            districtCity: t.search.districtCity,
            districtCityPlaceholder: t.search.districtCityPlaceholder,
            propertyType: t.common.propertyType,
            propertyTypeLabels: t.enums.propertyTypes,
            rooms: t.common.rooms,
            anyOption: t.search.anyOption,
            roomsPlus: t.search.roomsPlus,
            priceRange: t.search.priceRange,
            priceMin: t.search.priceMin,
            priceMax: t.search.priceMax,
            rentDuration: t.search.rentDuration,
            rentTypeLabels: t.enums.rentTypes,
            furnishingLabel: locale === "ru" ? "Мебель и состояние" : "Jihozlanganlik",
            furnishingLabels: t.enums.furnishingStatuses,
            sort: t.search.sort,
            sortNewest: t.search.sortNewest,
            sortPriceAsc: t.search.sortPriceAsc,
            sortPriceDesc: t.search.sortPriceDesc,
            nearMe: t.search.nearMe,
            locating: t.search.locating,
            nearMeActive: t.search.nearMeActive,
            nearMeError: t.search.nearMeError,
            verifiedOnly: t.search.verifiedOnly,
            resetFilters: t.search.resetFilters,
            applyFilters: t.search.applyFilters
          }}
        />

        <button
          type="submit"
          className="btn-primary hidden h-10 rounded-xl px-5 text-xs font-extrabold sm:inline-flex sm:h-11 sm:text-sm"
        >
          {t.search.searchButton}
        </button>
      </form>

      {/* Under Search Section: Nearby Listings Button + Quick Category Pills */}
      <div className="flex items-center gap-2 overflow-hidden">
        {/* Search nearby listings feature moved to main screen under search */}
        <div className="shrink-0">
          <NearMeButton
            copy={{
              nearMe: t.search.nearMe,
              locating: t.search.locating,
              nearMeActive: t.search.nearMeActive,
              nearMeError: t.search.nearMeError
            }}
          />
        </div>

        {/* Quick Category Pills */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {quickPills.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                pill.active
                  ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                  : "border-slate-200/90 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-2xs"
              }`}
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
