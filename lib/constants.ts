export const LISTING_TYPES = ["rent", "sale"] as const;
export const PROPERTY_TYPES = ["flat", "house", "studio", "room"] as const;
export const RENT_TYPES = ["monthly", "daily"] as const;
export const CURRENCIES = ["UZS", "USD"] as const;
export const SORT_OPTIONS = ["newest", "price_asc", "price_desc"] as const;
export const LISTING_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const FURNISHING_STATUSES = ["UNFURNISHED", "PARTIAL", "FURNISHED"] as const;

export const AMENITY_KEYS = [
  "heating",
  "ac",
  "washer",
  "fridge",
  "wifi",
  "pool",
  "tv",
  "kitchen",
  "balcony",
  "elevator",
  "metro",
  "parking",
  "sauna",
  "garden",
  "bbq",
  "security"
] as const;

export const TENANT_PREFERENCE_KEYS = [
  "family",
  "students",
  "boys",
  "girls",
  "foreigners",
  "all"
] as const;

export const PLACEHOLDER_IMAGE = "/placeholder-listing.svg";

export type ListingTypeValue = (typeof LISTING_TYPES)[number];
export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];
export type RentTypeValue = (typeof RENT_TYPES)[number];
export type CurrencyValue = (typeof CURRENCIES)[number];
export type FurnishingStatusValue = (typeof FURNISHING_STATUSES)[number];
export type AmenityKey = (typeof AMENITY_KEYS)[number];
export type TenantPreferenceKey = (typeof TENANT_PREFERENCE_KEYS)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  flat: "Flat",
  house: "House",
  studio: "Studio",
  room: "Room"
};

export const RENT_TYPE_LABELS: Record<RentTypeValue, string> = {
  monthly: "Monthly",
  daily: "Daily"
};
