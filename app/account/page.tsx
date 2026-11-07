import Link from "next/link";

export { privatePageMetadata as metadata } from "@/lib/site";
import { BackLink } from "@/components/back-link";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProfileSummary } from "@/components/profile-summary";
import { getFavoriteListingIds, getVisitorId } from "@/lib/favorites";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getRegionLabel, getRegionOptions } from "@/lib/locations";
import { getOwnerDashboardPath, isOwner } from "@/lib/owner";
import { getCurrentUser } from "@/lib/session-auth";

type AccountPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-ink/25"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function NavRow({
  href,
  icon,
  label,
  showDot = false
}: {
  href: string;
  icon: string;
  label: string;
  showDot?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 py-3 text-sm font-bold text-slate-200 transition hover:text-cyan-400"
    >
      <span className="flex items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-300 shadow-sm">
          <NavIcon path={icon} />
          {showDot ? (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-coral"
            />
          ) : null}
        </span>
        {label}
      </span>
      <ChevronRight />
    </Link>
  );
}

export default async function AccountPage({ searchParams = {} }: AccountPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await getCurrentUser();

  if (!user) {
    const visitorId = getVisitorId();
    const displayId = visitorId ? visitorId.replace(/-/g, "").slice(0, 8).toUpperCase() : "——————";
    const savedCount = (await getFavoriteListingIds(visitorId, null)).size;

    return (
      <div className="shell space-y-8">
        <BackLink href="/" label={t.common.backToListings} />

        <section className="panel overflow-hidden p-0">
          <div className="h-20 bg-gradient-to-r from-cyan-500/30 via-teal-500/20 to-indigo-500/30 sm:h-24" />
          <div className="flex flex-col items-center px-6 pb-8">
            <span className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#0D1219] bg-mist text-cyan-400 shadow-md sm:-mt-14 sm:h-28 sm:w-28">
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

            <p className="mt-3 font-display text-xl font-semibold tabular-nums text-ink">
              @{displayId}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
              {t.account.guestIdLabel}
            </p>

            <div className="mt-6 flex items-center gap-10 border-t border-line/70 pt-5">
              <Link href="/saved" className="flex flex-col items-center gap-0.5 text-center">
                <span className="font-display text-xl font-semibold tabular-nums text-ink">
                  {savedCount}
                </span>
                <span className="text-xs text-ink/50">{t.nav.saved}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const showOwnerDashboardLink = isOwner({ email: user.email });
  const profileUpdated = searchParams.updated === "1";
  const telegramError = typeof searchParams.telegramError === "string" ? searchParams.telegramError : null;
  const telegramErrorMessage =
    telegramError === "not-configured"
      ? t.account.phoneVerifyNotConfigured
      : telegramError === "no-phone"
        ? t.account.phoneVerifyNoPhone
        : null;

  const isProfileComplete = Boolean(user.phone && user.preferredRegion);
  const isEditMode = searchParams.edit === "1" || !isProfileComplete || Boolean(telegramErrorMessage);

  const mastheadCopy = {
    avatarChange: t.account.avatarChange,
    avatarUploading: t.account.avatarUploading,
    avatarUploadFailed: t.account.avatarUploadFailed,
    emailVerifiedBadge: t.account.emailVerifiedBadge,
    emailNotVerifiedBadge: t.account.emailNotVerifiedBadge,
    phoneVerifiedBadge: t.account.phoneVerifiedBadge,
    phoneNotVerifiedBadge: t.account.phoneNotVerifiedBadge,
    phoneNotSetBadge: t.account.phoneNotSetBadge
  };

  return (
    <div className="shell space-y-8">
      <BackLink href="/" label={t.common.backToListings} />

      {profileUpdated ? (
        <div className="rounded-[24px] border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
          {t.account.profileUpdated}
        </div>
      ) : null}

      {telegramErrorMessage ? (
        <div className="rounded-[24px] border border-amber-400/30 bg-amber-500/15 px-4 py-3 text-sm leading-6 text-amber-200">
          {telegramErrorMessage}
        </div>
      ) : null}

      {!isProfileComplete ? (
        <div className="rounded-[24px] border border-amber-400/30 bg-amber-500/15 px-4 py-3 text-sm leading-6 text-amber-200">
          <strong className="font-semibold">{t.account.incompleteProfileTitle}</strong>{" "}
          {t.account.incompleteProfileBody}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        {isEditMode ? (
          <ProfileEditForm
            name={user.name ?? ""}
            phone={user.phone ?? ""}
            email={user.email}
            avatarUrl={user.avatarUrl}
            emailVerifiedAt={user.emailVerifiedAt}
            phoneVerifiedAt={user.phoneVerifiedAt}
            regionOptions={getRegionOptions(locale)}
            preservedPreferences={{
              preferredRegion: user.preferredRegion,
              preferredDistrict: user.preferredDistrict,
              preferredPropertyType: user.preferredPropertyType,
              preferredRentType: user.preferredRentType,
              preferredMinPrice: user.preferredMinPrice,
              preferredMaxPrice: user.preferredMaxPrice
            }}
            copy={{
              sectionPersonal: t.account.profileSectionPersonal,
              sectionContact: t.account.profileSectionContact,
              sectionLocation: t.account.profileSectionLocation,
              name: t.account.name,
              phone: t.account.phone,
              save: t.account.saveProfile,
              region: t.search.region,
              anyRegion: t.search.allRegions,
              district: t.search.districtCity,
              districtPlaceholder: t.search.districtCityPlaceholder,
              locationDetect: t.account.locationDetect,
              locationDetecting: t.account.locationDetecting,
              locationUnsupported: t.account.locationUnsupported,
              locationPermissionDenied: t.account.locationPermissionDenied,
              locationFailed: t.account.locationFailed,
              locationDetectHint: t.account.locationDetectHint,
              phoneVerified: t.account.phoneVerified,
              phoneVerifyButton: t.account.phoneVerifyButton,
              phoneVerifyHint: t.account.phoneVerifyHint,
              ...mastheadCopy
            }}
          />
        ) : (
          <ProfileSummary
            name={user.name ?? ""}
            email={user.email}
            phone={user.phone ?? ""}
            avatarUrl={user.avatarUrl}
            emailVerifiedAt={user.emailVerifiedAt}
            phoneVerifiedAt={user.phoneVerifiedAt}
            regionLabel={getRegionLabel(user.preferredRegion, locale)}
            district={user.preferredDistrict}
            copy={{
              ...mastheadCopy,
              phoneRowLabel: t.account.phone,
              regionRowLabel: t.search.region,
              districtRowLabel: t.search.districtCity,
              notSet: t.account.notSet,
              editButton: t.account.editProfile
            }}
          />
        )}

        <div className="surface-tint flex flex-col p-4 sm:p-5">
          <div className="lg:sticky lg:top-24">
            <Link
              href="/add-listing"
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              <NavIcon path="M12 5v14M5 12h14" />
              {t.account.submitListing}
            </Link>

            <nav className="mt-2 divide-y divide-white/10 px-1">
              <NavRow
                href="/my-listings"
                label={t.account.trackListings}
                icon="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
              {showOwnerDashboardLink ? (
                <NavRow
                  href={getOwnerDashboardPath()}
                  label={t.account.ownerDashboard}
                  icon="M12 2 3 6v6c0 5 3.8 9 9 10 5.2-1 9-5 9-10V6z"
                />
              ) : null}
              <NavRow
                href="/account/sessions"
                label={t.account.manageSessions}
                icon="M5 11h14v9H5zM8 11V7a4 4 0 0 1 8 0v4"
              />
            </nav>

            <form action="/api/auth/logout" method="post" className="mt-2 border-t border-white/10 px-1 pt-2">
              <input type="hidden" name="next" value="/" />
              <button
                type="submit"
                className="flex w-full items-center gap-3 py-3 text-sm font-bold text-rose-400 transition hover:text-rose-300"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/15 text-rose-400">
                  <NavIcon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </span>
                {t.common.signOut}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
