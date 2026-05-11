import type { Locale } from "@/lib/i18n";

export const LEGACY_PRIMARY_LOCATION = "New Nurafshan, Tashkent Region" as const;
export const DEFAULT_REGION = "Tashkent Region" as const;
export const DEFAULT_DISTRICT = "Nurafshan" as const;
export const DEFAULT_CITY = "New Nurafshan" as const;

export const UZBEKISTAN_REGIONS = [
  "Tashkent City",
  "Tashkent Region",
  "Samarkand",
  "Bukhara",
  "Andijan",
  "Fergana",
  "Namangan",
  "Jizzakh",
  "Sirdaryo",
  "Kashkadarya",
  "Surkhandarya",
  "Khorezm",
  "Navoi",
  "Karakalpakstan"
] as const;

export type UzbekistanRegion = (typeof UZBEKISTAN_REGIONS)[number];

type LocationInput = {
  region?: string | null;
  district?: string | null;
  city?: string | null;
};

type LocationDetails = {
  region: string | null;
  districtCity: string | null;
  city: string | null;
};

const REGION_LABELS: Record<Locale, Record<UzbekistanRegion, string>> = {
  uz: {
    "Tashkent City": "Toshkent shahri",
    "Tashkent Region": "Toshkent viloyati",
    Samarkand: "Samarqand",
    Bukhara: "Buxoro",
    Andijan: "Andijon",
    Fergana: "Farg‘ona",
    Namangan: "Namangan",
    Jizzakh: "Jizzax",
    Sirdaryo: "Sirdaryo",
    Kashkadarya: "Qashqadaryo",
    Surkhandarya: "Surxondaryo",
    Khorezm: "Xorazm",
    Navoi: "Navoiy",
    Karakalpakstan: "Qoraqalpog‘iston"
  },
  ru: {
    "Tashkent City": "Ташкент",
    "Tashkent Region": "Ташкентская область",
    Samarkand: "Самарканд",
    Bukhara: "Бухара",
    Andijan: "Андижан",
    Fergana: "Фергана",
    Namangan: "Наманган",
    Jizzakh: "Джизак",
    Sirdaryo: "Сырдарья",
    Kashkadarya: "Кашкадарья",
    Surkhandarya: "Сурхандарья",
    Khorezm: "Хорезм",
    Navoi: "Навои",
    Karakalpakstan: "Каракалпакстан"
  }
};

export function isUzbekistanRegion(value?: string | null): value is UzbekistanRegion {
  return UZBEKISTAN_REGIONS.includes((value ?? "") as UzbekistanRegion);
}

export function getRegionLabel(region: string | null | undefined, locale: Locale) {
  if (isUzbekistanRegion(region)) {
    return REGION_LABELS[locale][region];
  }

  return region ?? "";
}

export function getRegionOptions(locale: Locale) {
  return UZBEKISTAN_REGIONS.map((value) => ({
    value,
    label: REGION_LABELS[locale][value]
  }));
}

export function normalizeLocation(input: LocationInput) {
  if (input.district === LEGACY_PRIMARY_LOCATION) {
    return {
      region: input.region || DEFAULT_REGION,
      district: DEFAULT_DISTRICT,
      city: input.city || DEFAULT_CITY
    };
  }

  return {
    region: input.region || null,
    district: input.district || null,
    city: input.city || null
  };
}

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function isSameLocationLabel(left?: string | null, right?: string | null) {
  return normalizeText(left)?.toLocaleLowerCase() === normalizeText(right)?.toLocaleLowerCase();
}

function joinUnique(parts: Array<string | null | undefined>, separator: string) {
  const uniqueParts: string[] = [];

  for (const part of parts) {
    const normalized = normalizeText(part);

    if (!normalized) {
      continue;
    }

    if (uniqueParts.some((item) => isSameLocationLabel(item, normalized))) {
      continue;
    }

    uniqueParts.push(normalized);
  }

  return uniqueParts.join(separator);
}

export function getLocationDetails(input: LocationInput, locale: Locale): LocationDetails {
  const normalized = normalizeLocation(input);
  const rawRegion = normalizeText(normalized.region);
  const region = normalizeText(getRegionLabel(normalized.region, locale));
  const district = normalizeText(normalized.district);
  const city = normalizeText(normalized.city);
  const districtCity =
    joinUnique(
      [
        district && !isSameLocationLabel(district, rawRegion) && !isSameLocationLabel(district, region)
          ? district
          : null,
        city
      ],
      " · "
    ) || null;

  return {
    region,
    districtCity,
    city
  };
}

export function formatLocationSummary(input: LocationInput, locale: Locale) {
  const normalized = normalizeLocation(input);
  const rawRegion = normalizeText(normalized.region);
  const region = normalizeText(getRegionLabel(normalized.region, locale));
  const district = normalizeText(normalized.district);
  const city = normalizeText(normalized.city);
  const primary =
    (district && !isSameLocationLabel(district, rawRegion) && !isSameLocationLabel(district, region)
      ? district
      : null) ||
    (city && !isSameLocationLabel(city, rawRegion) && !isSameLocationLabel(city, region)
      ? city
      : null) ||
    district ||
    city ||
    region;

  return joinUnique([primary, region], ", ");
}

export function formatLocationTrail(input: LocationInput, locale: Locale) {
  const { region, districtCity } = getLocationDetails(input, locale);

  return [districtCity, region].filter(Boolean);
}
