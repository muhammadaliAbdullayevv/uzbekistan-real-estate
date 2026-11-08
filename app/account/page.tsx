import Link from "next/link";

export { privatePageMetadata as metadata } from "@/lib/site";
import { BackLink } from "@/components/back-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProfileView } from "@/components/profile-view";
import { TelegramLoginButton } from "@/components/telegram-login-button";
import { prisma } from "@/lib/db";
import { getFavoriteListingIds, getVisitorId } from "@/lib/favorites";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getRegionOptions } from "@/lib/locations";
import { isOwner } from "@/lib/owner";
import { getCurrentUser } from "@/lib/session-auth";

type AccountPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AccountPage({ searchParams = {} }: AccountPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await getCurrentUser();
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? "HousliBot").replace(/^@/, "");

  if (!user) {
    const visitorId = getVisitorId();
    const displayId = visitorId ? visitorId.replace(/-/g, "").slice(0, 8).toUpperCase() : "——————";
    const savedCount = (await getFavoriteListingIds(visitorId, null)).size;

    return (
      <div className="shell space-y-6">
        <BackLink href="/" label={t.common.backToListings} />

        <section className="panel overflow-hidden p-0">
          <div className="h-24 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0284C7] sm:h-28" />
          <div className="mx-auto max-w-xl px-5 pb-8 sm:px-8">
            <div className="flex flex-col items-center text-center">
              <span className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#F3F6FB] text-blue-600 shadow-md sm:-mt-14 sm:h-28 sm:w-28">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-12 w-12 sm:h-14 sm:w-14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />
                </svg>
              </span>

              <p className="mt-3 font-display text-xl font-extrabold text-slate-900">
                Mehmon profili (@{displayId})
              </p>
              <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-slate-500">
                Shaxsingizni Telegram bot orqali tasdiqlab tizimga kiring. Saytda telefon raqamingiz va Telegram ismingiz ko&apos;rinadi hamda boshqa qurilmalarda kirish uchun Login va Parol beriladi.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/add-listing"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/25 transition hover:brightness-110 active:scale-98"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>{locale === "ru" ? "Разместить объявление" : "Yangi e'lon qo'shish"}</span>
              </Link>

              <TelegramLoginButton
                nextPath="/account"
                label="Telegram orqali tasdiqlash va kirish"
              />
              <Link
                href="/login?next=%2Faccount"
                className="btn-secondary flex w-full items-center justify-center gap-2 py-3.5 text-sm font-extrabold"
              >
                🔑 Login va parol bilan kirish (Boshqa qurilmadan)
              </Link>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌐</span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">{locale === "ru" ? "Язык приложения" : "Ilova tili"}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{locale === "ru" ? "Русский / O'zbekcha" : "O'zbekcha / Русский"}</p>
                  </div>
                </div>
                <LanguageSwitcher currentLocale={locale} label={t.language.label} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-10 border-t border-slate-200 pt-5">
              <Link href="/saved" className="flex flex-col items-center gap-0.5 text-center">
                <span className="font-display text-xl font-extrabold tabular-nums text-slate-900">
                  {savedCount}
                </span>
                <span className="text-xs font-semibold text-slate-500">{t.nav.saved}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const [listingsCount, favoritesCount, unreadCount, conversationsCount] = await Promise.all([
    prisma.listing.count({ where: { userId: user.id } }),
    prisma.favoriteListing.count({ where: { userId: user.id } }),
    prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: {
          OR: [{ buyerId: user.id }, { ownerId: user.id }]
        }
      }
    }),
    prisma.conversation.count({
      where: {
        OR: [{ buyerId: user.id }, { ownerId: user.id }]
      }
    })
  ]);

  const profileUpdated = searchParams.updated === "1";

  return (
    <div className="shell space-y-4 py-4 sm:py-6">
      <BackLink href="/" label={t.common.backToListings} />

      {profileUpdated ? (
        <div className="mx-auto max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
          {t.account.profileUpdated}
        </div>
      ) : null}

      <ProfileView
        locale={locale}
        user={user}
        botUsername={botUsername}
        isOwnerUser={isOwner({ email: user.email })}
        listingsCount={listingsCount}
        favoritesCount={favoritesCount}
        unreadCount={unreadCount}
        conversationsCount={conversationsCount}
        regionOptions={getRegionOptions(locale)}
        copy={{
          avatarChange: t.account.avatarChange,
          avatarUploading: t.account.avatarUploading,
          avatarUploadFailed: t.account.avatarUploadFailed,
          signOut: t.common.signOut
        }}
      />
    </div>
  );
}
