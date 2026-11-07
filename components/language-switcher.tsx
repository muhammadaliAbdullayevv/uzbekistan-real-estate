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
      <div className="inline-flex rounded-xl border border-slate-200 bg-[#F3F6FB] p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => setLocale("uz")}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] transition sm:text-[11px] ${
            currentLocale === "uz"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          UZ
        </button>
        <button
          type="button"
          onClick={() => setLocale("ru")}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] transition sm:text-[11px] ${
            currentLocale === "ru"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          RU
        </button>
      </div>
    </div>
  );
}
