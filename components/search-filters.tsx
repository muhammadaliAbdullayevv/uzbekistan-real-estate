import Link from "next/link";

import {
  FURNISHING_STATUSES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_TYPES
} from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { getRegionOptions } from "@/lib/locations";
import { LocationSelect } from "@/components/location-select";
import { NearMeButton } from "@/components/near-me-button";

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
  const currentRentType = values.rentType ?? "";
  const currentFurnishing = values.furnishing ?? "";
  const currentSort = values.sort ?? "newest";
  const isVerifiedOnly = values.verifiedOnly === "1";

  const roomOptions = [
    { value: "", label: t.search.anyOption },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: t.search.roomsPlus }
  ];

  return (
    <form className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#121822] to-[#0D121A] p-3.5 shadow-2xl sm:p-5">
      {values.nearLat && values.nearLng ? (
        <>
          <input type="hidden" name="nearLat" defaultValue={values.nearLat} />
          <input type="hidden" name="nearLng" defaultValue={values.nearLng} />
        </>
      ) : null}

      {/* Top Row: Segment Deal Control + Near Me GPS */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5">
        <div className="grid flex-1 grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-black/40 p-1 sm:max-w-md">
          {listingTypeOptions.map((option) => (
            <label key={option.value || "all"} className="cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value={option.value}
                defaultChecked={currentListingType === option.value}
                className="peer sr-only"
              />
              <span className="flex h-9 items-center justify-center rounded-xl px-2 text-center text-xs font-extrabold text-slate-400 transition peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-teal-400 peer-checked:text-slate-950 peer-checked:shadow-md sm:h-10 sm:text-sm">
                {option.label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <NearMeButton
            copy={{
              nearMe: t.search.nearMe,
              locating: t.search.locating,
              nearMeActive: t.search.nearMeActive,
              nearMeError: t.search.nearMeError
            }}
          />
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            {t.search.resetFilters}
          </Link>
        </div>
      </div>

      {/* Main Search Inputs: Keyword, Region, District, Submit */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(170px,210px)_minmax(170px,210px)_auto]">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="q" className="sr-only">
            {t.search.searchLabel}
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="q"
              name="q"
              placeholder={t.search.searchPlaceholder}
              defaultValue={values.q}
              className="input h-12 rounded-2xl pl-11 pr-4 text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <LocationSelect
            id="region"
            name="region"
            defaultValue={values.region}
            options={getRegionOptions(locale)}
            emptyLabel={t.search.allRegions}
            className="h-12 rounded-2xl text-sm font-medium"
          />
        </div>

        <div>
          <label htmlFor="district" className="sr-only">
            {t.search.districtCity}
          </label>
          <input
            id="district"
            name="district"
            defaultValue={values.district}
            placeholder={t.search.districtCityPlaceholder}
            className="input h-12 rounded-2xl text-sm font-medium"
          />
        </div>

        <button
          type="submit"
          className="btn-primary h-12 rounded-2xl px-6 text-sm font-extrabold shadow-lg shadow-cyan-500/20 sm:col-span-2 lg:col-span-1"
        >
          {t.search.searchButton}
        </button>
      </div>

      {/* Quick Filter Chips Bar: Rooms, Property Type, Rent Duration, Furnishing, Verified, Sort */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        {/* Rooms Pills */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
          <span className="px-2 text-[11px] font-bold text-slate-400">
            {t.common.rooms}:
          </span>
          {roomOptions.map((room) => (
            <label key={room.value || "any"} className="cursor-pointer">
              <input
                type="radio"
                name="rooms"
                value={room.value}
                defaultChecked={currentRooms === room.value}
                className="peer sr-only"
              />
              <span className="inline-flex h-7 items-center justify-center rounded-lg px-2 text-xs font-bold text-slate-300 transition peer-checked:bg-cyan-500/25 peer-checked:text-cyan-300 peer-checked:ring-1 peer-checked:ring-cyan-400/50">
                {room.label}
              </span>
            </label>
          ))}
        </div>

        {/* Property Type Select */}
        <select
          name="propertyType"
          defaultValue={currentPropertyType}
          aria-label={t.common.propertyType}
          className="select h-9 w-auto min-w-[125px] rounded-xl py-0 pl-3 pr-8 text-xs font-bold"
        >
          <option value="">{t.common.propertyType}: {t.search.anyOption}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t.enums.propertyTypes[type]}
            </option>
          ))}
        </select>

        {/* Rent Duration Select */}
        <select
          name="rentType"
          defaultValue={currentRentType}
          aria-label={t.search.rentDuration}
          className="select h-9 w-auto min-w-[125px] rounded-xl py-0 pl-3 pr-8 text-xs font-bold"
        >
          <option value="">{t.search.rentDuration}: {t.search.anyOption}</option>
          {RENT_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {t.enums.rentTypes[rt]}
            </option>
          ))}
        </select>

        {/* Furnishing Select */}
        <select
          name="furnishing"
          defaultValue={currentFurnishing}
          aria-label="Furnishing"
          className="select h-9 w-auto min-w-[125px] rounded-xl py-0 pl-3 pr-8 text-xs font-bold"
        >
          <option value="">{t.search.anyOption}</option>
          {FURNISHING_STATUSES.map((fs) => (
            <option key={fs} value={fs}>
              {t.enums.furnishingStatuses[fs]}
            </option>
          ))}
        </select>

        {/* Verified Owner Toggle */}
        <label className="cursor-pointer">
          <input
            type="checkbox"
            name="verifiedOnly"
            value="1"
            defaultChecked={isVerifiedOnly}
            className="peer sr-only"
          />
          <span className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0D131C] px-3 text-xs font-bold text-slate-300 transition peer-checked:border-emerald-400/50 peer-checked:bg-emerald-500/15 peer-checked:text-emerald-300">
            <span>✓</span>
            <span>{t.search.verifiedOnly}</span>
          </span>
        </label>

        {/* Sort Select */}
        <div className="ml-auto flex items-center gap-1.5">
          <select
            name="sort"
            defaultValue={currentSort}
            aria-label={t.search.sort}
            className="select h-9 w-auto min-w-[145px] rounded-xl py-0 pl-3 pr-8 text-xs font-bold"
          >
            <option value="newest">{t.search.sortNewest}</option>
            <option value="price_asc">{t.search.sortPriceAsc}</option>
            <option value="price_desc">{t.search.sortPriceDesc}</option>
          </select>
        </div>
      </div>
    </form>
  );
}
