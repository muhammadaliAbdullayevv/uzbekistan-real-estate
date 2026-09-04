"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { PropertyImage } from "@/components/property-image";

type Locale = "uz" | "ru";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

type RecommendedListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  listingType: string;
  rentType: string | null;
  district: string;
  region: string;
  rooms: number;
  area: number;
  image: string | null;
};

type AiUychiThreadProps = {
  locale: Locale;
  copy: {
    placeholder: string;
    send: string;
    sending: string;
    emptyState: string;
    disclaimer: string;
    viewListing: string;
    genericError: string;
  };
};

// Kept in sync with the [[listing:ID]] convention the model is instructed
// to use in lib/ai-uychi.ts (not imported directly -- that file pulls in
// Prisma/server-only code that can't ship to the client bundle).
function splitResponse(text: string) {
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

function formatCompactPrice(listing: RecommendedListing, locale: Locale) {
  const amount = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "uz-UZ").format(listing.price);
  const suffix =
    listing.listingType === "rent" ? (listing.rentType === "daily" ? "/kun" : "/oy") : "";
  return `${amount} ${listing.currency}${suffix}`;
}

function ListingChip({ id, listings, locale, viewLabel }: { id: string; listings: RecommendedListing[]; locale: Locale; viewLabel: string }) {
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return null;
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 transition hover:border-accent/40"
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">
        <PropertyImage src={listing.image} alt={listing.title} fill className="object-cover" sizes="56px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{listing.title}</span>
        <span className="block text-xs text-ink/50">
          {listing.district} · {listing.rooms} · {listing.area} m²
        </span>
        <span className="block text-sm font-semibold text-accent">
          {formatCompactPrice(listing, locale)}
        </span>
      </span>
      <span className="shrink-0 text-xs font-medium text-accent">{viewLabel}</span>
    </Link>
  );
}

export function AiUychiThread({ locale, copy }: AiUychiThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [listingsByMessage, setListingsByMessage] = useState<Record<number, RecommendedListing[]>>({});
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();

    if (!text || isSending) {
      return;
    }

    setError(null);
    const nextMessages = [...messages, { role: "user" as const, text }];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-uychi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? copy.genericError);
      }

      setMessages((current) => {
        const updated = [...current, { role: "model" as const, text: data.text }];
        setListingsByMessage((prevListings) => ({
          ...prevListings,
          [updated.length - 1]: data.listings ?? []
        }));
        return updated;
      });

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (sendIssue) {
      setError(sendIssue instanceof Error ? sendIssue.message : copy.genericError);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="panel flex flex-col overflow-hidden p-0">
      <div ref={scrollRef} className="h-[60vh] max-h-[560px] min-h-[320px] space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/50">{copy.emptyState}</p>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] space-y-2 ${message.role === "user" ? "" : "w-full"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    message.role === "user" ? "bg-accent text-white" : "bg-mist text-ink"
                  }`}
                >
                  {message.role === "model"
                    ? splitResponse(message.text).map((part, partIndex) =>
                        part.type === "text" ? (
                          <span key={partIndex} className="whitespace-pre-line">
                            {part.value}
                          </span>
                        ) : null
                      )
                    : <span className="whitespace-pre-line">{message.text}</span>}
                </div>

                {message.role === "model"
                  ? splitResponse(message.text)
                      .filter((part) => part.type === "listing")
                      .map((part) =>
                        part.type === "listing" ? (
                          <ListingChip
                            key={part.id}
                            id={part.id}
                            listings={listingsByMessage[index] ?? []}
                            locale={locale}
                            viewLabel={copy.viewListing}
                          />
                        ) : null
                      )
                  : null}
              </div>
            </div>
          ))
        )}

        {isSending ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl bg-mist px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" />
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="border-t border-coral/20 bg-coral/10 px-4 py-2.5 text-sm text-coral">{error}</div>
      ) : null}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line/70 px-4 py-3 sm:px-5">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.placeholder}
          maxLength={2000}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? copy.sending : copy.send}
        </button>
      </form>

      <p className="border-t border-line/70 px-4 py-2 text-center text-[11px] text-ink/40 sm:px-6">
        {copy.disclaimer}
      </p>
    </div>
  );
}
