"use client";

import { useState } from "react";

type LocationDetectButtonProps = {
  regionSelectId: string;
  districtInputId: string;
  regionValues: readonly string[];
  copy: {
    detect: string;
    detecting: string;
    unsupported: string;
    permissionDenied: string;
    failed: string;
  };
};

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
};

export function LocationDetectButton({
  regionSelectId,
  districtInputId,
  regionValues,
  copy
}: LocationDetectButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  function applyResult(data: ReverseGeocodeResponse) {
    const regionSelect = document.getElementById(regionSelectId) as HTMLSelectElement | null;
    const districtInput = document.getElementById(districtInputId) as HTMLInputElement | null;

    const haystack = `${data.principalSubdivision ?? ""} ${data.city ?? ""} ${data.locality ?? ""}`.toLowerCase();
    const matchedRegion = regionValues.find((value) => haystack.includes(value.toLowerCase()));

    if (regionSelect && matchedRegion) {
      regionSelect.value = matchedRegion;
    }

    const districtGuess = data.city || data.locality;
    if (districtInput && districtGuess) {
      districtInput.value = districtGuess;
    }
  }

  function handleDetect() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(copy.unsupported);
      return;
    }

    setError(null);
    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (!response.ok) {
            throw new Error(copy.failed);
          }

          const data = (await response.json()) as ReverseGeocodeResponse;
          applyResult(data);
        } catch {
          setError(copy.failed);
        } finally {
          setStatus("idle");
        }
      },
      () => {
        setError(copy.permissionDenied);
        setStatus("idle");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDetect}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink/20 hover:bg-mist/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        {status === "loading" ? copy.detecting : copy.detect}
      </button>
      {error ? <p className="mt-2 text-xs text-coral">{error}</p> : null}
    </div>
  );
}
