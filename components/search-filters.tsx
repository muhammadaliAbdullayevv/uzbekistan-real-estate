import Link from "next/link";

import { CURRENCIES, LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { getRegionOptions } from "@/lib/locations";
import { LocationSelect } from "@/components/location-select";

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
    currency?: string;
    sort?: string;
  };
};

export function SearchFilters({ locale, values }: SearchFiltersProps) {
  const t = getTranslations(locale);
  const showMoreFilters = Boolean(
    values.minPrice ||
      values.maxPrice ||
      values.rooms ||
      values.propertyType ||
      values.currency ||
      (values.sort && values.sort !== "newest")
  );
  const popularRegions = [
    {
      value: "Tashkent City",
      label: locale === "uz" ? "Toshkent" : "Ташкент"
    },
    {
      value: "Samarkand",
      label: locale === "uz" ? "Samarqand" : "Самарканд"
    },
    {
      value: "Bukhara",
      label: locale === "uz" ? "Buxoro" : "Бухара"
    },
    {
      value: "Fergana",
      label: locale === "uz" ? "Farg‘ona" : "Фергана"
    },
    {
      value: "Andijan",
      label: locale === "uz" ? "Andijon" : "Андижан"
    }
  ];

  return (
    <form className="panel space-y-4 p-3 sm:p-5 md:p-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,220px)_minmax(180px,220px)_minmax(150px,180px)_auto] lg:items-end">
        <div>
          <label htmlFor="q" className="mb-2 block text-sm font-medium text-ink/80">
            {t.search.searchLabel}
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
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
              className="input h-12 rounded-[18px] pl-11 pr-4 text-base shadow-sm placeholder:text-sm sm:h-14 sm:rounded-[20px] sm:pl-12"
            />
          </div>
        </div>

        <LocationSelect
          id="region"
          name="region"
          label={t.search.region}
          defaultValue={values.region}
          options={getRegionOptions(locale)}
          emptyLabel={t.search.allRegions}
          className="h-12 rounded-[18px] text-base sm:h-14 sm:rounded-[20px]"
        />

        <div>
          <label htmlFor="district" className="mb-2 block text-sm font-medium text-ink/80">
            {t.search.districtCity}
          </label>
          <input
            id="district"
            name="district"
            defaultValue={values.district}
            placeholder={t.search.districtCityPlaceholder}
            className="input h-12 rounded-[18px] text-base placeholder:text-sm sm:h-14 sm:rounded-[20px]"
          />
        </div>

        <div>
          <label htmlFor="listingType" className="mb-2 block text-sm font-medium text-ink/80">
            {t.common.listingType}
          </label>
          <select
            id="listingType"
            name="listingType"
            defaultValue={values.listingType}
            className="select h-12 rounded-[18px] text-base sm:h-14 sm:rounded-[20px]"
          >
            <option value="">{t.search.allListingTypes}</option>
            {LISTING_TYPES.map((listingType) => (
              <option key={listingType} value={listingType}>
                {t.enums.listingTypes[listingType]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="btn-primary h-12 w-full px-6 shadow-[0_18px_40px_rgba(15,23,42,0.16)] sm:h-14 sm:px-8 lg:min-w-[140px] lg:w-auto"
          >
            {t.search.searchButton}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line/70 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/42">
          {t.search.popularAreas}
        </p>
        <div className="flex flex-wrap gap-2">
          {popularRegions.map((region) => (
            <Link
              key={region.value}
              href={`/?region=${encodeURIComponent(region.value)}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/72 transition hover:border-ink/30 hover:bg-mist/60 hover:text-ink"
            >
              {region.label}
            </Link>
          ))}
        </div>
      </div>

      <details
        open={showMoreFilters}
        className="rounded-[22px] border border-line/70 bg-mist/55 px-3 py-3 sm:rounded-[24px] sm:px-4"
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
          {t.search.moreFilters}
        </summary>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div>
            <label htmlFor="minPrice" className="mb-2 block text-sm font-medium text-ink/80">
              {t.search.minPrice}
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min="0"
              defaultValue={values.minPrice}
              placeholder={t.search.noMinimum}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="mb-2 block text-sm font-medium text-ink/80">
              {t.search.maxPrice}
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              defaultValue={values.maxPrice}
              placeholder={t.search.noMaximum}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="rooms" className="mb-2 block text-sm font-medium text-ink/80">
              {t.search.rooms}
            </label>
            <input
              id="rooms"
              name="rooms"
              type="number"
              min="1"
              defaultValue={values.rooms}
              placeholder={t.search.any}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="propertyType" className="mb-2 block text-sm font-medium text-ink/80">
              {t.search.propertyType}
            </label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={values.propertyType}
              className="select"
            >
              <option value="">{t.search.allTypes}</option>
              {PROPERTY_TYPES.map((propertyType) => (
                <option key={propertyType} value={propertyType}>
                  {t.enums.propertyTypes[propertyType]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="mb-2 block text-sm font-medium text-ink/80">
              {t.search.currency}
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={values.currency}
              className="select"
            >
              <option value="">{t.search.allCurrencies}</option>
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="mb-2 block text-sm font-medium text-ink/80">
              {t.search.sort}
            </label>
            <select id="sort" name="sort" defaultValue={values.sort} className="select">
              <option value="newest">{t.search.newest}</option>
              <option value="price_asc">{t.search.priceAsc}</option>
              <option value="price_desc">{t.search.priceDesc}</option>
            </select>
          </div>
        </div>
      </details>
    </form>
  );
}
