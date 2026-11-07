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
    <div className="fixed inset-x-0 top-[61px] bottom-0 flex flex-col bg-[#090C10] sm:static sm:top-auto sm:bottom-auto sm:mx-auto sm:mt-6 sm:h-[75vh] sm:max-h-[720px] sm:max-w-2xl sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-soft">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#111926] to-[#0A1018] px-3 py-2.5 sm:px-5">
        <BackIconButton href="/chat" label={copy.backLabel} />
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-cyan-500/15 text-sm font-bold text-cyan-300">
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
          <p className="truncate font-display text-base font-extrabold text-white">{otherName}</p>
          <Link
            href={`/listings/${listingId}`}
            className="block truncate text-xs text-slate-400 hover:text-cyan-400"
          >
            {listingTitle}
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-[#121822] px-3.5 py-2.5 text-[14.5px] leading-[1.45] text-slate-200 shadow-sm">
              {copy.emptyThread}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-[1.45] shadow-md ${
                    isOwn
                      ? "rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "rounded-bl-md border border-white/10 bg-[#121822] text-slate-100"
                  }`}
                >
                  <span className="whitespace-pre-line">{message.body}</span>
                  <span className={`mt-1 block text-right text-[10px] ${isOwn ? "text-cyan-100/80" : "text-slate-400"}`}>
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
        className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-[#0C1118] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-2.5"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.messagePlaceholder}
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
