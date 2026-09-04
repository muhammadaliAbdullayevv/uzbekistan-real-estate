"use client";

import { useEffect, useRef, useState } from "react";

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
  initialMessages: WireMessage[];
  locale: Locale;
  copy: {
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
  initialMessages,
  locale,
  copy
}: ChatThreadProps) {
  const [messages, setMessages] = useState<WireMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  async function handleSend(event: React.FormEvent) {
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
    <div className="flex flex-col">
      <div
        ref={scrollRef}
        className="h-[60vh] max-h-[560px] min-h-[320px] space-y-3 overflow-y-auto px-5 py-4 sm:px-6"
      >
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/50">{copy.emptyThread}</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    isOwn ? "bg-accent text-white" : "bg-mist text-ink"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.body}</p>
                  <p className={`mt-1 text-[11px] ${isOwn ? "text-white/70" : "text-ink/45"}`}>
                    {formatTime(new Date(message.createdAt), locale)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-line/70 px-4 py-3 sm:px-5"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.messagePlaceholder}
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
    </div>
  );
}
