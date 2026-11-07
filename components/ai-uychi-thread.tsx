"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { BackIconButton } from "@/components/back-icon-button";
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
      className="flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 shadow-sm transition hover:border-cyan-400 hover:bg-cyan-500/15"
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">
        <PropertyImage src={listing.image} alt={listing.title} fill className="object-cover" sizes="56px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-white">{listing.title}</span>
        <span className="block text-xs text-slate-300">
          {listing.district} · {listing.rooms} · {listing.area} m²
        </span>
        <span className="block text-sm font-extrabold text-cyan-400">
          {formatCompactPrice(listing, locale)}
        </span>
      </span>
      <span className="shrink-0 rounded-lg bg-cyan-400 px-2.5 py-1 text-xs font-extrabold text-slate-950">{viewLabel}</span>
    </Link>
  );
}

function BotAvatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/20">
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

  const samplePrompts =
    locale === "ru"
      ? [
          "Найди 2-комнатную квартиру в Чиланзаре до $450",
          "Посуточная студия в Юнусабаде",
          "Дом в Ташкенте на продажу"
        ]
      : [
          "Chilonzorda 450$ gacha 2 xonali toza kvartira top",
          "Yunusobodda kunlik ijaraga studiya",
          "Toshkentda sotiladigan hovli uy"
        ];

  return (
    <div className="fixed inset-x-0 top-[61px] bottom-0 flex flex-col bg-[#090C10] sm:static sm:top-auto sm:bottom-auto sm:mx-auto sm:mt-6 sm:h-[75vh] sm:max-h-[720px] sm:max-w-2xl sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-soft">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#111926] to-[#0A1018] px-3 py-3 sm:px-5">
        <BackIconButton href="/" label={copy.backLabel} />
        <BotAvatar />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-extrabold text-white">{copy.title}</p>
          <p className="truncate text-xs text-cyan-400">{copy.subtitle}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="max-w-[88%] space-y-2.5 rounded-2xl rounded-bl-md border border-white/10 bg-[#121822] px-4 py-3 text-[14.5px] leading-[1.45] text-slate-200 shadow-sm">
              <p>{copy.emptyState}</p>
              <div className="space-y-1.5 pt-1">
                {samplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setDraft(prompt)}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-bold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
                  >
                    💡 &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] flex-col space-y-1.5 ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-[1.45] shadow-md ${
                      isUser
                        ? "rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        : "rounded-bl-md border border-white/10 bg-[#121822] text-slate-100"
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
                    <span className={`mt-1 block text-right text-[10px] ${isUser ? "text-cyan-100/80" : "text-slate-400"}`}>
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
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-[#121822] px-4 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" />
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="shrink-0 border-t border-coral/20 bg-coral/10 px-4 py-2 text-sm text-coral">{error}</div>
      ) : null}

      <form onSubmit={handleSend} className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-[#0C1118] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-2.5">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.placeholder}
          maxLength={2000}
          className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:bg-white/10"
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          aria-label={copy.send}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 -translate-x-px translate-y-px" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
