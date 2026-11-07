import Link from "next/link";

import { HeaderAvatarLink } from "@/components/header-avatar-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UychiMark } from "@/components/uychi-mark";
import { hasGeminiConfig } from "@/lib/gemini";
import { getLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import { getUserSession } from "@/lib/user-session";

export async function SiteHeader() {
  const session = await getUserSession();
  const locale = getLocale();
  const t = getTranslations(locale);
  const avatarInitial = session
    ? (session.name?.trim()?.[0] || session.email[0] || "?").toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 shadow-[0_2px_10px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="shell py-2.5 md:py-3.5">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <UychiMark className="h-8 w-8 shrink-0 md:h-9 md:w-9" />
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">
                {siteConfig.name.toUpperCase()}
              </span>
              <span className="text-[11px] font-extrabold text-blue-600 sm:text-xs">.UZ</span>
            </div>
          </Link>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {hasGeminiConfig() ? (
              <Link
                href="/ai-uychi"
                className="hidden items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:inline-flex"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3Z" />
                </svg>
                <span>{t.aiUychi.title}</span>
              </Link>
            ) : null}

            <LanguageSwitcher currentLocale={locale} label={t.language.label} />

            <Link
              href="/add-listing"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-2.5 py-1.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="sm:hidden">{locale === "ru" ? "Подать" : "E'lon"}</span>
              <span className="hidden sm:inline">{t.nav.addListing}</span>
            </Link>

            {session ? (
              <HeaderAvatarLink
                avatarUrl={session.avatarUrl}
                initial={avatarInitial}
                label={t.nav.account}
              />
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-[#F3F6FB] px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:px-3.5 sm:py-2"
              >
                {t.nav.login}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
