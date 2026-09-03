import Image from "next/image";
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
  const profileHref = canAccessOwner ? ownerHref : "/account";
  const avatarInitial = session
    ? (session.name?.trim()?.[0] || session.email[0] || "?").toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/95 backdrop-blur">
      <div className="shell py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-ink text-xs font-bold text-white md:h-10 md:w-10 md:text-sm">
              UZ
            </div>
            <p className="hidden truncate font-display text-base font-semibold tracking-tight text-ink sm:block sm:text-lg md:text-xl">
              Uzbekistan Rentals
            </p>
          </Link>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <LanguageSwitcher currentLocale={locale} label={t.language.label} />

            {session ? (
              <>
                <Link
                  href="/add-listing"
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>{t.nav.addListing}</span>
                </Link>

                <Link
                  href={profileHref}
                  aria-label={t.nav.account}
                  title={t.nav.account}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 text-sm font-bold text-accent transition hover:bg-accent/15 sm:h-10 sm:w-10"
                >
                  {session.avatarUrl ? (
                    <Image
                      src={session.avatarUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-line/80 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-ink/20 hover:bg-mist/60 sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  {t.nav.register}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
