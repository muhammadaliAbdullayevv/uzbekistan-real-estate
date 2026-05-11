"use client";

import { useRouter } from "next/navigation";

type LanguageSwitcherProps = {
  currentLocale: "uz" | "ru";
  label: string;
};

const COOKIE_NAME = "site-locale";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function LanguageSwitcher({
  currentLocale,
  label
}: LanguageSwitcherProps) {
  const router = useRouter();

  function setLocale(nextLocale: "uz" | "ru") {
    if (nextLocale === currentLocale) {
      return;
    }

    document.cookie = `${COOKIE_NAME}=${nextLocale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <div className="inline-flex rounded-full border border-line/80 bg-mist/70 p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => setLocale("uz")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:text-[11px] ${
            currentLocale === "uz"
              ? "bg-ink text-white shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          UZ
        </button>
        <button
          type="button"
          onClick={() => setLocale("ru")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:text-[11px] ${
            currentLocale === "ru"
              ? "bg-ink text-white shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          RU
        </button>
      </div>
    </div>
  );
}
