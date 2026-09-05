"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { PropertyImage } from "@/components/property-image";

type Locale = "uz" | "ru";

type ChatMessage = {
  role: "user" | "model";
  text: string;
  time: string;
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
    title: string;
    subtitle: string;
    backLabel: string;
    placeholder: string;
    send: string;
    sending: string;
    emptyState: string;
    viewListing: string;
    genericError: string;
  };
};

function formatTime(locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "uz-UZ", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

// Session-only (not localStorage): the conversation isn't persisted server
// side at all, so this is just enough to survive tapping into a
// recommended listing and back, not a real chat history -- it should not
// outlive the browser tab.
const STORAGE_KEY = "ai-uychi-thread-v1";

type StoredThread = {
  messages: ChatMessage[];
  listingsByMessage: Record<number, RecommendedListing[]>;
};

function loadStoredThread(): StoredThread | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<StoredThread>;
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      listingsByMessage: parsed.listingsByMessage ?? {}
    };
  } catch {
    return null;
  }
}

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
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-sm transition hover:border-accent/40"
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

function BotAvatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink to-accent text-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
      </svg>
    </span>
  );
}

export function AiUychiThread({ locale, copy }: AiUychiThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredThread()?.messages ?? []);
  const [listingsByMessage, setListingsByMessage] = useState<Record<number, RecommendedListing[]>>(
    () => loadStoredThread()?.listingsByMessage ?? {}
  );
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasRestoredScroll = useRef(false);

  // Persist so navigating to a recommended listing and back (or just
  // switching tabs) doesn't silently reset the conversation -- this is
  // sessionStorage, not a real saved chat history.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, listingsByMessage }));
    } catch {
      // Best-effort -- losing the restore is better than crashing the chat.
    }
  }, [messages, listingsByMessage]);

  useEffect(() => {
    if (hasRestoredScroll.current || messages.length === 0) {
      return;
    }
    hasRestoredScroll.current = true;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();

    if (!text || isSending) {
      return;
    }

    setError(null);
    const nextMessages = [...messages, { role: "user" as const, text, time: formatTime(locale) }];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-uychi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, text }) => ({ role, text })) })
      });

      // A slow AI reply can outlast an upstream proxy's timeout, which
      // answers with its own HTML error page instead of letting the
      // request through -- parse defensively so that shows the normal
      // error message instead of a raw "Unexpected token '<'" crash.
      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        throw new Error(data?.error ?? copy.genericError);
      }

      setMessages((current) => {
        const updated = [...current, { role: "model" as const, text: data.text, time: formatTime(locale) }];
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
    <div className="fixed inset-x-0 top-[61px] bottom-0 flex flex-col bg-mist sm:static sm:top-auto sm:bottom-auto sm:mx-auto sm:mt-6 sm:h-[75vh] sm:max-h-[720px] sm:max-w-2xl sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-line/70 sm:shadow-soft">
      <div className="flex shrink-0 items-center gap-3 border-b border-line/70 bg-white px-3 py-2.5 sm:px-5">
        <Link
          href="/"
          aria-label={copy.backLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 transition hover:bg-mist hover:text-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <BotAvatar />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold text-ink">{copy.title}</p>
          <p className="truncate text-xs text-ink/50">{copy.subtitle}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14.5px] leading-[1.45] text-ink shadow-sm">
              {copy.emptyState}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] flex-col space-y-1.5 ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-[14.5px] leading-[1.45] shadow-sm ${
                      isUser
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-white text-ink"
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
                    <span className={`mt-1 block text-right text-[10px] ${isUser ? "text-white/70" : "text-ink/35"}`}>
                      {message.time}
                    </span>
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
            );
          })
        )}

        {isSending ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" />
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="shrink-0 border-t border-coral/20 bg-coral/10 px-4 py-2 text-sm text-coral">{error}</div>
      ) : null}

      <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-line/70 bg-white px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-2.5">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.placeholder}
          maxLength={2000}
          className="h-11 flex-1 rounded-full border border-line bg-mist px-4 text-sm text-ink outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15"
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          aria-label={copy.send}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 -translate-x-px translate-y-px" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
