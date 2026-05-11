import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getOwnerDashboardPath, isOwner } from "@/lib/owner";
import { getUserSession } from "@/lib/user-session";

export async function SiteHeader() {
  const session = await getUserSession();
  const locale = getLocale();
  const t = getTranslations(locale);
  const ownerHref = getOwnerDashboardPath();
  const canAccessOwner = isOwner(session);
  const signedInLinks = (
    <>
      <Link href="/" className="btn-secondary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.rentals}
      </Link>
      <Link href="/add-listing" className="btn-primary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.addListing}
      </Link>
      <Link href="/favorites" className="btn-secondary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.saved}
      </Link>
      <Link href="/account" className="btn-secondary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.account}
      </Link>
      {canAccessOwner ? (
        <Link href={ownerHref} className="btn-secondary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
          {t.nav.owner}
        </Link>
      ) : null}
    </>
  );
  const signedOutLinks = (
    <>
      <Link href="/" className="btn-secondary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.rentals}
      </Link>
      <Link href="/login" className="btn-secondary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.login}
      </Link>
      <Link href="/register" className="btn-primary w-full px-3 py-2 text-center text-sm md:w-auto md:px-4 md:py-2.5">
        {t.nav.register}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/95 backdrop-blur">
      <div className="shell py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-ink text-xs font-bold text-white md:h-10 md:w-10 md:text-sm">
              UZ
            </div>
            <p className="truncate font-display text-base font-semibold tracking-tight text-ink sm:text-lg md:text-xl">
              Uzbekistan Rentals
            </p>
          </Link>

          <nav className="hidden items-center gap-2 md:flex md:flex-wrap md:justify-end md:gap-3">
            <LanguageSwitcher currentLocale={locale} label={t.language.label} />
            {session ? signedInLinks : signedOutLinks}
          </nav>

          <details className="relative md:hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-2xl border border-line/80 bg-white text-ink shadow-sm transition hover:border-ink/20 hover:bg-mist/60">
              <span className="sr-only">{t.nav.menu}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(18rem,calc(100vw-2rem))] rounded-[24px] border border-line/80 bg-white/98 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur">
              <div className="mb-4 flex justify-end">
                <LanguageSwitcher currentLocale={locale} label={t.language.label} />
              </div>
              <nav className="grid gap-2">
                {session ? signedInLinks : signedOutLinks}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
