import { LocationSelect } from "@/components/location-select";
import { PROPERTY_TYPES, RENT_TYPES } from "@/lib/constants";

type PreferencesPromptProps = {
  name: string;
  phone: string;
  regionOptions: Array<{ value: string; label: string }>;
  propertyTypeLabels: Record<(typeof PROPERTY_TYPES)[number], string>;
  rentTypeLabels: Record<(typeof RENT_TYPES)[number], string>;
  copy: {
    title: string;
    description: string;
    region: string;
    anyRegion: string;
    district: string;
    districtPlaceholder: string;
    propertyType: string;
    anyPropertyType: string;
    rentType: string;
    anyRentType: string;
    minPrice: string;
    maxPrice: string;
    save: string;
    skip: string;
  };
};

export function PreferencesPrompt({
  name,
  phone,
  regionOptions,
  propertyTypeLabels,
  rentTypeLabels,
  copy
}: PreferencesPromptProps) {
  return (
    <section className="panel space-y-5 border-accent/25 bg-accent/5 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">{copy.description}</p>
      </div>

      <form action="/api/account/preferences" method="post" className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="phone" value={phone} />

        <LocationSelect
          id="preferredRegion"
          name="preferredRegion"
          label={copy.region}
          emptyLabel={copy.anyRegion}
          options={regionOptions}
        />

        <div>
          <label htmlFor="preferredDistrict" className="mb-2 block text-sm font-medium text-ink/80">
            {copy.district}
          </label>
          <input
            id="preferredDistrict"
            name="preferredDistrict"
            className="input"
            placeholder={copy.districtPlaceholder}
          />
        </div>

        <div>
          <label htmlFor="preferredPropertyType" className="mb-2 block text-sm font-medium text-ink/80">
            {copy.propertyType}
          </label>
          <select id="preferredPropertyType" name="preferredPropertyType" className="select" defaultValue="">
            <option value="">{copy.anyPropertyType}</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {propertyTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preferredRentType" className="mb-2 block text-sm font-medium text-ink/80">
            {copy.rentType}
          </label>
          <select id="preferredRentType" name="preferredRentType" className="select" defaultValue="">
            <option value="">{copy.anyRentType}</option>
            {RENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {rentTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preferredMinPrice" className="mb-2 block text-sm font-medium text-ink/80">
            {copy.minPrice}
          </label>
          <input id="preferredMinPrice" name="preferredMinPrice" type="number" min="0" className="input" />
        </div>

        <div>
          <label htmlFor="preferredMaxPrice" className="mb-2 block text-sm font-medium text-ink/80">
            {copy.maxPrice}
          </label>
          <input id="preferredMaxPrice" name="preferredMaxPrice" type="number" min="0" className="input" />
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button type="submit" className="btn-primary">
            {copy.save}
          </button>
        </div>
      </form>

      <form action="/api/account/preferences/dismiss" method="post">
        <button
          type="submit"
          className="text-sm font-medium text-ink/55 underline underline-offset-4 transition hover:text-ink"
        >
          {copy.skip}
        </button>
      </form>
    </section>
  );
}
