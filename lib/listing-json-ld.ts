import type { ListingWithImages } from "@/lib/listings";
import { getAbsoluteUrl } from "@/lib/site";

/**
 * schema.org structured data for a listing detail page. Deliberately omits
 * latitude/longitude -- raw coordinates are never sent to the client for
 * public listing views (see lib/listings.ts), only the district/region/
 * address text that's already shown on the page in plain HTML.
 */
export function buildListingJsonLd(listing: ListingWithImages) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: getAbsoluteUrl(`/listings/${listing.id}`),
    image: listing.images.map((image) => image.url),
    datePosted: listing.createdAt.toISOString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city || listing.district,
      addressRegion: listing.region,
      addressCountry: "UZ"
    },
    numberOfRooms: listing.rooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.area,
      unitCode: "MTK"
    },
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      businessFunction:
        listing.listingType === "rent" ? "https://schema.org/LeaseOut" : "https://schema.org/Sell"
    }
  };
}

/**
 * Listing title/description/address are user-submitted. JSON.stringify
 * doesn't escape "<", so a title containing literally "</script>" could
 * break out of the JSON-LD script tag -- escaping "<" to its unicode
 * form neutralizes that without changing the parsed JSON value.
 */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
