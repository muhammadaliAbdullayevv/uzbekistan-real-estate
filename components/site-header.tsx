import Link from "next/link";

import { HeaderAvatarLink } from "@/components/header-avatar-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UychiMark } from "@/components/uychi-mark";
import { instrumentSans } from "@/lib/fonts";
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
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/95 backdrop-blur">
      <div className="shell py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <UychiMark className="h-8 w-8 shrink-0 md:h-9 md:w-9" />
            <p
              className={`${instrumentSans.className} hidden truncate text-lg leading-none tracking-[-0.038em] text-pine sm:block sm:text-xl md:text-2xl`}
            >
              {siteConfig.name}
            </p>
          </Link>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <LanguageSwitcher currentLocale={locale} label={t.language.label} />

            {session ? (
              <>
                <Link
                  href="/add-listing"
                  className="hidden shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent sm:flex sm:px-4 sm:py-2.5 sm:text-sm"
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

                <HeaderAvatarLink
                  avatarUrl={session.avatarUrl}
                  initial={avatarInitial}
                  label={t.nav.account}
                />
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
