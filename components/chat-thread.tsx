"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { BackIconButton } from "@/components/back-icon-button";
import { isLocalImageUrl } from "@/lib/image-url";

type Locale = "uz" | "ru";

type WireMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type ChatThreadProps = {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  otherAvatarUrl: string | null;
  listingId: string;
  listingTitle: string;
  initialMessages: WireMessage[];
  locale: Locale;
  copy: {
    backLabel: string;
    emptyThread: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
  };
};

const POLL_INTERVAL_MS = 4000;

function formatTime(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "uz-UZ", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function ChatThread({
  conversationId,
  currentUserId,
  otherName,
  otherAvatarUrl,
  listingId,
  listingTitle,
  initialMessages,
  locale,
  copy
}: ChatThreadProps) {
  const [messages, setMessages] = useState<WireMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initial = (otherName.trim()[0] || "?").toUpperCase();

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!response.ok || cancelled) {
          return;
        }
        const data = (await response.json()) as { messages: WireMessage[] };
        if (!cancelled) {
          setMessages(data.messages);
        }
      } catch {
        // Best-effort polling: a dropped tick just retries on the next interval.
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();

    if (!body || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });

      if (response.ok) {
        const data = (await response.json()) as { message: WireMessage };
        setMessages((current) => [...current, data.message]);
        setDraft("");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-x-0 top-[61px] bottom-0 flex flex-col bg-mist sm:static sm:top-auto sm:bottom-auto sm:mx-auto sm:mt-6 sm:h-[75vh] sm:max-h-[720px] sm:max-w-2xl sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-line/70 sm:shadow-soft">
      <div className="flex shrink-0 items-center gap-3 border-b border-line/70 bg-white px-3 py-2.5 sm:px-5">
        <BackIconButton href="/chat" label={copy.backLabel} />
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 text-sm font-bold text-accent">
          {otherAvatarUrl ? (
            <Image
              src={otherAvatarUrl}
              alt=""
              fill
              unoptimized={isLocalImageUrl(otherAvatarUrl)}
              sizes="36px"
              className="object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold text-ink">{otherName}</p>
          <Link
            href={`/listings/${listingId}`}
            className="block truncate text-xs text-ink/50 hover:text-accent"
          >
            {listingTitle}
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14.5px] leading-[1.45] text-ink shadow-sm">
              {copy.emptyThread}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[14.5px] leading-[1.45] shadow-sm ${
                    isOwn ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-white text-ink"
                  }`}
                >
                  <span className="whitespace-pre-line">{message.body}</span>
                  <span className={`mt-1 block text-right text-[10px] ${isOwn ? "text-white/70" : "text-ink/35"}`}>
                    {formatTime(new Date(message.createdAt), locale)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-line/70 bg-white px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-2.5"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.messagePlaceholder}
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
