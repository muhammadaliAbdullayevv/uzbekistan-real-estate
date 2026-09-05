import { CURRENCIES, LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { getApprovedListings, type ListingWithImages } from "@/lib/listings";
import { UZBEKISTAN_REGIONS } from "@/lib/locations";

export const AI_UYCHI_MAX_MESSAGES_PER_HOUR = 20;

export type AiUychiFilters = {
  listingType?: string;
  region?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  propertyType?: string;
  currency?: string;
  sort?: string;
  q?: string;
};

export type AiUychiExtraction = {
  action: "search" | "reply";
  replyText?: string;
  filters?: AiUychiFilters;
};

// Gemini's JSON response mode takes an OpenAPI-subset schema, not a
// TypeScript type -- this is what actually constrains the model's output.
export const aiUychiExtractionSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["search", "reply"],
      description:
        "'search' when the conversation gives enough to look up real listings. 'reply' for anything else: a vague request that needs one clarifying question, a general question, or an off-topic message."
    },
    replyText: {
      type: "string",
      description: "Required when action is 'reply'. Not used when action is 'search'."
    },
    filters: {
      type: "object",
      description: "Required when action is 'search'.",
      properties: {
        listingType: { type: "string", enum: [...LISTING_TYPES], description: "rent or sale" },
        region: { type: "string", enum: [...UZBEKISTAN_REGIONS] },
        district: { type: "string", description: "District or city name, free text, partial match ok." },
        minPrice: { type: "number" },
        maxPrice: { type: "number" },
        rooms: { type: "number", description: "Exact room count -- only set when the user gave a specific number, this is not a minimum." },
        propertyType: { type: "string", enum: [...PROPERTY_TYPES] },
        currency: { type: "string", enum: [...CURRENCIES] },
        sort: {
          type: "string",
          enum: ["price_asc", "price_desc"],
          description: "price_asc for cheap/arzon/eng arzon requests, price_desc for expensive/qimmat/hashamatli/premium requests. Leave unset otherwise."
        },
        q: {
          type: "string",
          description: "Extra free-text keywords not covered by the fields above (e.g. a landmark or complex name). Use sparingly -- prefer the structured fields."
        }
      }
    }
  },
  required: ["action"]
};

function languageLine(locale: Locale) {
  return locale === "ru"
    ? "Respond in Russian unless the user writes in another language, in which case switch to match them."
    : "Respond in Uzbek (Latin script) unless the user writes in another language, in which case switch to match them.";
}

export function buildExtractionInstruction(locale: Locale) {
  return [
    "You are the request router for AI Uychi, a real estate assistant for Uzbekistan Rentals, a property marketplace for Uzbekistan (rent and sale of flats, houses, and rooms).",
    "Read the whole conversation, not just the latest message, and decide exactly one action.",
    "",
    "Choose \"search\" when there's enough to look up real listings -- extract it into `filters`. Carry forward anything implied by earlier turns (e.g. if the user already said Namangan and now just adds \"3 xonali\", keep region: Namangan). This applies to listingType too -- once the user states rent vs sale (ijara/sotib olish, arenda/prodazha, rent/buy) in any turn, keep filters.listingType set on every later search in the same conversation unless they explicitly change it.",
    "Choose \"reply\" for everything else, and put the answer directly in `replyText`:",
    "- The request is too vague to search yet -- ask ONE short clarifying question (budget, region/district, room count, rent vs sale).",
    "- It's a general question about renting/buying, neighborhoods in Uzbekistan, or how the site works -- answer briefly. For legal, tax, or contract questions, give cautious general guidance and note it isn't a substitute for verifying with the listing owner or an official source.",
    "- It's unrelated to real estate -- politely redirect.",
    "",
    languageLine(locale),
    "Keep replyText concise -- this is a chat interface on a small screen, not an essay."
  ].join("\n");
}

export function buildPhrasingInstruction(locale: Locale) {
  return [
    "You are AI Uychi, a helpful real estate assistant for Uzbekistan Rentals. A search already ran for the user's request -- the real results are given to you as JSON in the final message below.",
    "",
    "Hard rules:",
    "- NEVER invent a listing, price, or address. Only describe properties from the provided results.",
    "- When you mention a specific listing, write [[listing:ID]] on its own line right after mentioning it, using the exact id from the results. The app renders it as a card.",
    "- If the results are empty, say so plainly and suggest loosening a filter (price, district) rather than inventing an alternative.",
    "- Keep answers concise. This is a chat interface on a small screen, not an essay.",
    "",
    languageLine(locale)
  ].join("\n");
}

export function toCompactListing(listing: ListingWithImages) {
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

/** Runs the extracted filters directly against the real search, no AI involved. */
export async function searchListingsForAi(filters: AiUychiFilters) {
  const params = {
    listingType: filters.listingType,
    region: filters.region,
    district: filters.district,
    minPrice: typeof filters.minPrice === "number" ? String(filters.minPrice) : undefined,
    maxPrice: typeof filters.maxPrice === "number" ? String(filters.maxPrice) : undefined,
    rooms: typeof filters.rooms === "number" ? String(filters.rooms) : undefined,
    propertyType: filters.propertyType,
    currency: filters.currency,
    sort: filters.sort,
    q: filters.q
  };

  return (await getApprovedListings(params)).slice(0, 8);
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
