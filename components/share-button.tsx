"use client";

import { useState } from "react";

type ShareButtonProps = {
  title: string;
  url?: string;
  locale?: "uz" | "ru";
  variant?: "button" | "icon";
};

export function ShareButton({
  title,
  url,
  locale = "uz",
  variant = "button"
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareData = {
      title,
      text: title,
      url: shareUrl
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback for older clipboard APIs
      }
    }
  }

  const label = locale === "ru" ? "Поделиться" : "Ulashish";
  const copiedLabel = locale === "ru" ? "Скопировано!" : "Nusxalandi!";

  if (variant === "icon") {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleShare}
          aria-label={label}
          className="badge-blur inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 shadow-md transition hover:scale-110 hover:text-blue-600 sm:h-9 sm:w-9"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.1"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>

        {copied ? (
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-white shadow-lg animate-in fade-in zoom-in-95">
            {copiedLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 active:scale-95"
      >
        <svg
          className="h-3.5 w-3.5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span>{copied ? copiedLabel : label}</span>
      </button>

      {copied ? (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-black text-white shadow-lg animate-in fade-in zoom-in-95">
          {copiedLabel}
        </span>
      ) : null}
    </div>
  );
}
