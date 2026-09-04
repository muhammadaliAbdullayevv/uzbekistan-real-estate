import { CURRENCIES, LISTING_TYPES, PROPERTY_TYPES, RENT_TYPES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { getApprovedListings, type ListingWithImages } from "@/lib/listings";
import { UZBEKISTAN_REGIONS } from "@/lib/locations";
import type { FunctionDeclaration } from "@/lib/gemini";

export const AI_UYCHI_MAX_MESSAGES_PER_HOUR = 20;

const SEARCH_TOOL_NAME = "search_listings";

export const searchListingsDeclaration: FunctionDeclaration = {
  name: SEARCH_TOOL_NAME,
  description:
    "Search real, currently-approved property listings on the site. Always use this before recommending or describing any specific property -- never invent listings, prices, or details. Returns at most 8 matches.",
  parameters: {
    type: "object",
    properties: {
      listingType: { type: "string", enum: [...LISTING_TYPES], description: "rent or sale" },
      region: { type: "string", enum: [...UZBEKISTAN_REGIONS] },
      district: { type: "string", description: "Free-text district/city name, partial match ok." },
      minPrice: { type: "number" },
      maxPrice: { type: "number" },
      rooms: { type: "number", description: "Minimum number of rooms." },
      propertyType: { type: "string", enum: [...PROPERTY_TYPES] },
      currency: { type: "string", enum: [...CURRENCIES] }
    }
  }
};

function toCompactListing(listing: ListingWithImages) {
  return {
    id: listing.id,
    title: listing.title,
    listingType: listing.listingType,
    rentType: listing.rentType,
    price: listing.price,
    currency: listing.currency,
    region: listing.region,
    district: listing.district,
    rooms: listing.rooms,
    area: listing.area,
    propertyType: listing.propertyType
  };
}

export async function handleSearchListings(args: Record<string, unknown>) {
  const filters = {
    listingType: typeof args.listingType === "string" ? args.listingType : undefined,
    region: typeof args.region === "string" ? args.region : undefined,
    district: typeof args.district === "string" ? args.district : undefined,
    minPrice: typeof args.minPrice === "number" ? String(args.minPrice) : undefined,
    maxPrice: typeof args.maxPrice === "number" ? String(args.maxPrice) : undefined,
    rooms: typeof args.rooms === "number" ? String(args.rooms) : undefined,
    propertyType: typeof args.propertyType === "string" ? args.propertyType : undefined,
    currency: typeof args.currency === "string" ? args.currency : undefined
  };

  const results = (await getApprovedListings(filters)).slice(0, 8);

  return {
    count: results.length,
    listings: results.map(toCompactListing),
    listingIds: results.map((listing) => listing.id)
  };
}

export const aiUychiTools = {
  declarations: [searchListingsDeclaration],
  handlers: { [SEARCH_TOOL_NAME]: handleSearchListings }
};

export function buildSystemInstruction(locale: Locale) {
  const languageLine =
    locale === "ru"
      ? "Respond in Russian unless the user writes in another language, in which case switch to match them."
      : "Respond in Uzbek (Latin script) unless the user writes in another language, in which case switch to match them.";

  return [
    "You are AI Uychi, a helpful real estate assistant for Uzbekistan Rentals, a property marketplace for Uzbekistan (rent and sale of flats, houses, and rooms).",
    languageLine,
    "",
    "You can do three things:",
    "1. Help find properties through conversation -- ask brief clarifying questions when the request is vague (budget, region/district, room count, rent vs sale), then use the search_listings function to find real matches.",
    "2. Recommend specific properties from real search results, with a short reason each fits what the user described.",
    "3. Answer general questions about renting/buying, neighborhoods in Uzbekistan, and how the site works.",
    "",
    "Hard rules:",
    "- NEVER invent a listing, price, or address. Only describe properties returned by search_listings.",
    "- When you recommend a specific listing, reference it by writing [[listing:ID]] on its own line right after mentioning it, using the exact id from the search results. The app will render it as a card.",
    "- If search_listings returns zero results, say so plainly and suggest loosening a filter (price, district) rather than inventing an alternative.",
    "- For legal, tax, or contract questions, give general, cautious guidance and note it isn't a substitute for verifying with the listing owner or an official source -- you don't have authoritative knowledge of current Uzbek regulations.",
    "- Keep answers concise. This is a chat interface on a small screen, not an essay.",
    "- Stay focused on real estate and this site. If asked something entirely unrelated, politely redirect."
  ].join("\n");
}

/** Splits AI response text on [[listing:ID]] markers into renderable segments. */
export function parseAiUychiResponse(text: string) {
  const parts: Array<{ type: "text"; value: string } | { type: "listing"; id: string }> = [];
  const pattern = /\[\[listing:([a-zA-Z0-9_-]+)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "listing", id: match[1] });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}
