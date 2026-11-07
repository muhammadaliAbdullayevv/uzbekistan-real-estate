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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090C10]/90 backdrop-blur-xl">
      <div className="shell py-3 md:py-3.5">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <UychiMark className="h-8 w-8 shrink-0 md:h-9 md:w-9" />
            <div className="flex items-baseline gap-1">
              <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
                {siteConfig.name.toUpperCase()}
              </span>
              <span className="text-xs font-extrabold text-cyan-400">.UZ</span>
            </div>
          </Link>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {hasGeminiConfig() ? (
              <Link
                href="/ai-uychi"
                className="hidden items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 sm:inline-flex"
              >
                <span aria-hidden="true">✨</span>
                <span>{t.aiUychi.title}</span>
              </Link>
            ) : null}

            <LanguageSwitcher currentLocale={locale} label={t.language.label} />

            <Link
              href="/add-listing"
              className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-teal-300 sm:flex sm:px-4 sm:py-2 sm:text-sm"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>{t.nav.addListing}</span>
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
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition hover:border-cyan-400/40 hover:bg-white/10 sm:px-3.5 sm:py-2"
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
