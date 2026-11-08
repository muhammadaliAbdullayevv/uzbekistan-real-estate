import { getLocale } from "@/lib/i18n";

export async function SiteHeader() {
  const locale = getLocale();
  const isRu = locale === "ru";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 px-3 py-2 backdrop-blur-xl shadow-xs sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <form
          action="/"
          method="get"
          className="flex flex-1 items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-[#F4F7FB] px-3.5 py-2 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 text-slate-400 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <label htmlFor="top-search" className="sr-only">
            {isRu ? "Поиск" : "Qidirish"}
          </label>
          <input
            id="top-search"
            type="search"
            name="q"
            placeholder={
              isRu
                ? "Поиск по городу, району, адресу..."
                : "Shahar, tuman yoki manzil bo'yicha qidirish..."
            }
            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden sm:text-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-3.5 py-1 text-xs font-black text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            {isRu ? "Найти" : "Qidirish"}
          </button>
        </form>
      </div>
    </header>
  );
}
