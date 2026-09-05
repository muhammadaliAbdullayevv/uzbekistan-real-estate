import { LISTING_TYPES } from "@/lib/constants";
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

  return (
    <form className="surface-tint flex flex-col gap-2.5 p-2.5 sm:p-3">
      {/* type="hidden" inputs still count as siblings for a space-y-*
          selector (only a literal hidden attribute is skipped), which was
          stacking an extra margin onto NearMeButton below -- flex+gap
          instead, since gap only applies between elements actually still
          in flow (these are display:none by default). */}
      {/* Only rendered when a real "near me" search is active -- otherwise
          every ordinary search submit (e.g. just picking a listing type)
          would carry an empty nearLat/nearLng pair into the URL, which
          made the near-me button visually show "active" for a search that
          never used location at all. */}
      {values.nearLat && values.nearLng ? (
        <>
          <input type="hidden" name="nearLat" defaultValue={values.nearLat} />
          <input type="hidden" name="nearLng" defaultValue={values.nearLng} />
        </>
      ) : null}

      <NearMeButton
        copy={{
          nearMe: t.search.nearMe,
          locating: t.search.locating,
          nearMeActive: t.search.nearMeActive,
          nearMeError: t.search.nearMeError
        }}
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,220px)_minmax(180px,220px)]">
        <div className="col-span-2 lg:col-span-1">
          <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink/80">
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
          <label htmlFor="district" className="mb-1 block text-sm font-medium text-ink/80">
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
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-ink/80">{t.common.listingType}</p>
          <div className="grid grid-cols-3 gap-2">
            {listingTypeOptions.map((option) => (
              <label key={option.value || "all"} className="cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value={option.value}
                  defaultChecked={currentListingType === option.value}
                  className="peer sr-only"
                />
                <span className="flex h-11 items-center justify-center rounded-[14px] border border-line bg-white px-2 text-center text-sm font-medium text-ink/70 transition peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent sm:h-14 sm:rounded-[18px]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary h-12 px-6 shadow-[0_18px_40px_rgba(15,23,42,0.16)] sm:h-14 sm:px-8"
        >
          {t.search.searchButton}
        </button>
      </div>
    </form>
  );
}
