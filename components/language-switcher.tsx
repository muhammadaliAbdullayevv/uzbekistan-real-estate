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
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => setLocale("uz")}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] transition sm:text-[11px] ${
            currentLocale === "uz"
              ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          UZ
        </button>
        <button
          type="button"
          onClick={() => setLocale("ru")}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] transition sm:text-[11px] ${
            currentLocale === "ru"
              ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          RU
        </button>
      </div>
    </div>
  );
}
