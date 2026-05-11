import {
  type CurrencyValue,
  type ListingTypeValue,
  type PropertyTypeValue,
  type RentTypeValue
} from "@/lib/constants";
import { getLocaleForDate, getTranslations, type Locale } from "@/lib/i18n";

function formatCompactUzbekSom(price: number, numberLocale: string) {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    const roundedMillions = millions >= 100 ? Math.round(millions) : Number(millions.toFixed(1));

    return `${new Intl.NumberFormat(numberLocale, {
      minimumFractionDigits: Number.isInteger(roundedMillions) ? 0 : 1,
      maximumFractionDigits: 1
    }).format(roundedMillions)} mln UZS`;
  }

  return `${new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: 0
  }).format(price)} UZS`;
}

export function formatPrice(
  price: number,
  currency: CurrencyValue,
  listingType: ListingTypeValue,
  rentType: RentTypeValue | null | undefined,
  locale: Locale
) {
  const t = getTranslations(locale);
  const numberLocale = locale === "ru" ? "ru-RU" : "uz-UZ";
  const suffix =
    listingType === "rent"
      ? rentType === "daily"
        ? t.common.perDay
        : t.common.perMonth
      : "";

  if (currency === "USD") {
    return `$${new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: 0
    }).format(price)}${suffix}`;
  }

  return `${formatCompactUzbekSom(price, numberLocale)}${suffix}`;
}

export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(getLocaleForDate(locale), {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatDisplayName(name?: string | null) {
  if (!name) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeTelegramUsername(username?: string | null) {
  if (!username) {
    return null;
  }

  return username.replace(/^@+/, "").trim();
}

export function getTelegramLink(username?: string | null) {
  const cleanUsername = normalizeTelegramUsername(username);

  return cleanUsername ? `https://t.me/${cleanUsername}` : null;
}

export function getRentTypeLabel(rentType: RentTypeValue | null | undefined, locale: Locale) {
  if (!rentType) {
    return "";
  }

  return getTranslations(locale).enums.rentTypes[rentType];
}

export function getPropertyTypeLabel(
  propertyType: PropertyTypeValue,
  locale: Locale
) {
  return getTranslations(locale).enums.propertyTypes[propertyType];
}

export function getListingTypeLabel(listingType: ListingTypeValue, locale: Locale) {
  return getTranslations(locale).enums.listingTypes[listingType];
}
