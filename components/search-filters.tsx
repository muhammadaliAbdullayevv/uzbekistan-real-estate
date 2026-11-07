import Link from "next/link";

import {
  CURRENCIES,
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
  const currentRentType = values.rentType ?? "";
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
    values.rentType,
    values.furnishing,
    values.verifiedOnly,
    values.nearLat,
    values.sort && values.sort !== "newest" ? values.sort : undefined
  ].filter(Boolean).length;

  const roomOptions = [
    { value: "", label: t.search.anyOption },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: t.search.roomsPlus }
  ];

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
      label: t.enums.propertyTypes.house,
      href: "/?propertyType=house",
      active: currentPropertyType === "house"
    },
    {
      label: t.enums.propertyTypes.room,
      href: "/?propertyType=room",
      active: currentPropertyType === "room"
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
    <div className="space-y-2.5">
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

        {/* Hidden Filter Modal Trigger & Drawer */}
        <SearchFilterModal activeCount={activeFilterCount} filterLabel={t.search.filters}>
          <div className="space-y-4">
            {/* Deal Type Segmented Toggle */}
            <div>
              <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                {t.common.listingType}
              </p>
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                {listingTypeOptions.map((option) => (
                  <label key={option.value || "all"} className="cursor-pointer">
                    <input
                      type="radio"
                      name="listingType"
                      value={option.value}
                      defaultChecked={currentListingType === option.value}
                      className="peer sr-only"
                    />
                    <span className="flex h-9 items-center justify-center rounded-xl px-2 text-center text-xs font-extrabold text-slate-600 transition peer-checked:bg-blue-600 peer-checked:text-white peer-checked:shadow-sm">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Region & District */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="region" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  {t.search.region}
                </label>
                <LocationSelect
                  id="region"
                  name="region"
                  defaultValue={values.region}
                  options={getRegionOptions(locale)}
                  emptyLabel={t.search.allRegions}
                  className="h-11 rounded-xl text-xs font-semibold sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="district" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  {t.search.districtCity}
                </label>
                <input
                  id="district"
                  name="district"
                  defaultValue={values.district}
                  placeholder={t.search.districtCityPlaceholder}
                  className="input h-11 rounded-xl text-xs font-semibold sm:text-sm"
                />
              </div>
            </div>

            {/* Property Type & Rooms */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="propertyType" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  {t.common.propertyType}
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  defaultValue={currentPropertyType}
                  className="select h-11 rounded-xl text-xs font-semibold sm:text-sm"
                >
                  <option value="">{t.search.anyOption}</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t.enums.propertyTypes[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-extrabold text-slate-700">
                  {t.common.rooms}
                </p>
                <div className="grid grid-cols-6 gap-1 rounded-xl border border-slate-200 bg-[#F3F6FB] p-1">
                  {roomOptions.map((room) => (
                    <label key={room.value || "any"} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rooms"
                        value={room.value}
                        defaultChecked={currentRooms === room.value}
                        className="peer sr-only"
                      />
                      <span className="flex h-8 items-center justify-center rounded-lg text-xs font-extrabold text-slate-600 transition peer-checked:bg-blue-600 peer-checked:text-white">
                        {room.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Range & Currency */}
            <div>
              <p className="mb-1.5 text-xs font-extrabold text-slate-700">
                {t.search.priceRange}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  defaultValue={values.minPrice}
                  placeholder={t.search.priceMin}
                  className="input h-11 rounded-xl text-xs font-semibold sm:text-sm"
                />
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  defaultValue={values.maxPrice}
                  placeholder={t.search.priceMax}
                  className="input h-11 rounded-xl text-xs font-semibold sm:text-sm"
                />
                <select
                  name="currency"
                  defaultValue={currentCurrency}
                  className="select h-11 rounded-xl text-xs font-semibold sm:text-sm"
                >
                  <option value="">USD / UZS</option>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rent Duration, Furnishing & Sort */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="rentType" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  {t.search.rentDuration}
                </label>
                <select
                  id="rentType"
                  name="rentType"
                  defaultValue={currentRentType}
                  className="select h-11 rounded-xl text-xs font-semibold"
                >
                  <option value="">{t.search.anyOption}</option>
                  {RENT_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {t.enums.rentTypes[rt]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="furnishing" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  {locale === "ru" ? "Мебель" : "Jihozlanganlik"}
                </label>
                <select
                  id="furnishing"
                  name="furnishing"
                  defaultValue={currentFurnishing}
                  className="select h-11 rounded-xl text-xs font-semibold"
                >
                  <option value="">{t.search.anyOption}</option>
                  {FURNISHING_STATUSES.map((fs) => (
                    <option key={fs} value={fs}>
                      {t.enums.furnishingStatuses[fs]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  {t.search.sort}
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={currentSort}
                  className="select h-11 rounded-xl text-xs font-semibold"
                >
                  <option value="newest">{t.search.sortNewest}</option>
                  <option value="price_asc">{t.search.sortPriceAsc}</option>
                  <option value="price_desc">{t.search.sortPriceDesc}</option>
                </select>
              </div>
            </div>

            {/* GPS Near Me & Verified Owner */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <NearMeButton
                copy={{
                  nearMe: t.search.nearMe,
                  locating: t.search.locating,
                  nearMeActive: t.search.nearMeActive,
                  nearMeError: t.search.nearMeError
                }}
              />

              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  name="verifiedOnly"
                  value="1"
                  defaultChecked={isVerifiedOnly}
                  className="peer sr-only"
                />
                <span className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-[#F3F6FB] px-3 text-xs font-bold text-slate-700 transition peer-checked:border-emerald-300 peer-checked:bg-emerald-50 peer-checked:text-emerald-700">
                  <span>✓</span>
                  <span>{t.search.verifiedOnly}</span>
                </span>
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2.5 border-t border-slate-200 pt-4">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-[#F3F6FB] px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 sm:text-sm"
              >
                {t.search.resetFilters}
              </Link>
              <button
                type="submit"
                className="btn-primary h-11 flex-1 rounded-xl text-xs font-extrabold sm:text-sm"
              >
                {t.search.applyFilters}
              </button>
            </div>
          </div>
        </SearchFilterModal>

        <button
          type="submit"
          className="btn-primary hidden h-10 rounded-xl px-5 text-xs font-extrabold sm:inline-flex sm:h-11 sm:text-sm"
        >
          {t.search.searchButton}
        </button>
      </form>

      {/* Quick Category Pills */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {quickPills.map((pill) => (
          <Link
            key={pill.label}
            href={pill.href}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
              pill.active
                ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                : "border-slate-200/90 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {pill.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
