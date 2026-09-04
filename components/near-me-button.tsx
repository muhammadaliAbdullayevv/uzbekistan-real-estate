"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type NearMeButtonProps = {
  copy: {
    nearMe: string;
    locating: string;
    nearMeActive: string;
    nearMeError: string;
  };
};

export function NearMeButton({ copy }: NearMeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = searchParams.has("nearLat") && searchParams.has("nearLng");

  function navigateWithParams(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    router.push(next.size > 0 ? `${pathname}?${next.toString()}` : pathname);
  }

  function handleClick() {
    if (isActive) {
      navigateWithParams((params) => {
        params.delete("nearLat");
        params.delete("nearLng");
      });
      return;
    }

    if (!("geolocation" in navigator)) {
      setError(copy.nearMeError);
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        navigateWithParams((params) => {
          params.set("nearLat", String(position.coords.latitude));
          params.set("nearLng", String(position.coords.longitude));
        });
      },
      () => {
        setIsLocating(false);
        setError(copy.nearMeError);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocating}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isActive
            ? "border-accent bg-accent text-white"
            : "border-line bg-white text-ink hover:border-accent/50 hover:text-accent"
        }`}
      >
        {isActive ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-6.14-7-11a7 7 0 0 1 14 0c0 4.86-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        )}
        {isLocating ? copy.locating : isActive ? copy.nearMeActive : copy.nearMe}
      </button>
      {error ? <p className="text-xs text-coral">{error}</p> : null}
    </div>
  );
}
