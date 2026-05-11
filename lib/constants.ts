export const LISTING_TYPES = ["rent", "sale"] as const;
export const PROPERTY_TYPES = ["flat", "house", "room"] as const;
export const RENT_TYPES = ["monthly", "daily"] as const;
export const CURRENCIES = ["UZS", "USD"] as const;
export const SORT_OPTIONS = ["newest", "price_asc", "price_desc"] as const;
export const LISTING_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export const PLACEHOLDER_IMAGE = "/placeholder-listing.svg";

export type ListingTypeValue = (typeof LISTING_TYPES)[number];
export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];
export type RentTypeValue = (typeof RENT_TYPES)[number];
export type CurrencyValue = (typeof CURRENCIES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  flat: "Flat",
  house: "House",
  room: "Room"
};

export const RENT_TYPE_LABELS: Record<RentTypeValue, string> = {
  monthly: "Monthly",
  daily: "Daily"
};
