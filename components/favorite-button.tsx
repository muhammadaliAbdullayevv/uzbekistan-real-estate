"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState, type MouseEvent } from "react";

type FavoriteButtonProps = {
  listingId: string;
  isFavorited: boolean;
  variant?: "button" | "icon";
  copy: {
    save: string;
    saved: string;
    saveListing: string;
    removeFromSaved: string;
  };
};

export function FavoriteButton({
  listingId,
  isFavorited,
  variant = "button",
  copy
}: FavoriteButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(isFavorited);
  const [isPending, setIsPending] = useState(false);

  async function handleToggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    setIsPending(true);
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: nextSaved ? "POST" : "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to update favorites.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSaved(!nextSaved);
    } finally {
      setIsPending(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={saved}
        aria-label={saved ? copy.removeFromSaved : copy.saveListing}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:w-10"
      >
        <HeartIcon filled={saved} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={saved}
      className="btn-secondary w-full gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
    >
      <HeartIcon filled={saved} />
      {saved ? copy.saved : copy.save}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-4 w-4 sm:h-5 sm:w-5 ${filled ? "fill-coral text-coral" : "fill-none text-ink"}`}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7 4.7 4.7 0 0 1 6.8 0L12 7.2l.4-.5a4.7 4.7 0 0 1 6.8 0 4.9 4.9 0 0 1 0 7Z" />
    </svg>
  );
}
