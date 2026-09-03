import { AvatarUpload } from "@/components/avatar-upload";
import { LocationDetectButton } from "@/components/location-detect-button";
import { LocationSelect } from "@/components/location-select";
import { UZBEKISTAN_REGIONS } from "@/lib/locations";

type ProfileEditFormProps = {
  name: string;
  phone: string;
  telegramUsername: string;
  email: string;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  memberSinceValue: string;
  regionOptions: Array<{ value: string; label: string }>;
  preservedPreferences: {
    preferredRegion: string | null;
    preferredDistrict: string | null;
    preferredPropertyType: string | null;
    preferredRentType: string | null;
    preferredMinPrice: number | null;
    preferredMaxPrice: number | null;
  };
  copy: {
    sectionPersonal: string;
    sectionContact: string;
    sectionLocation: string;
    name: string;
    phone: string;
    telegramUsername: string;
    telegramPlaceholder: string;
    memberSinceLabel: string;
    save: string;
    avatarChange: string;
    avatarUploading: string;
    avatarUploadFailed: string;
    region: string;
    anyRegion: string;
    district: string;
    districtPlaceholder: string;
    locationDetect: string;
    locationDetecting: string;
    locationUnsupported: string;
    locationPermissionDenied: string;
    locationFailed: string;
    phoneVerified: string;
    phoneVerifyButton: string;
    phoneVerifyHint: string;
    emailVerifiedBadge: string;
    emailNotVerifiedBadge: string;
    phoneVerifiedBadge: string;
    phoneNotVerifiedBadge: string;
    phoneNotSetBadge: string;
  };
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function StatusBadge({ tone, children }: { tone: "positive" | "warning" | "neutral"; children: string }) {
  const toneClasses =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-line bg-mist text-ink/55";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClasses}`}
    >
      {tone === "positive" ? <CheckIcon /> : null}
      {children}
    </span>
  );
}

export function ProfileEditForm({
  name,
  phone,
  telegramUsername,
  email,
  avatarUrl,
  emailVerifiedAt,
  phoneVerifiedAt,
  memberSinceValue,
  regionOptions,
  preservedPreferences,
  copy
}: ProfileEditFormProps) {
  const initial = (name.trim()[0] || email[0] || "?").toUpperCase();

  return (
    <section className="panel p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AvatarUpload
            initialUrl={avatarUrl}
            initial={initial}
            size="lg"
            copy={{
              change: copy.avatarChange,
              uploading: copy.avatarUploading,
              uploadFailed: copy.avatarUploadFailed
            }}
          />
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-semibold text-ink sm:text-2xl">
              {name || email}
            </p>
            <p className="mt-1 truncate text-sm text-ink/55">{email}</p>
            <p className="mt-0.5 text-xs text-ink/40">
              {copy.memberSinceLabel} {memberSinceValue}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
          <StatusBadge tone={emailVerifiedAt ? "positive" : "warning"}>
            {emailVerifiedAt ? copy.emailVerifiedBadge : copy.emailNotVerifiedBadge}
          </StatusBadge>
          <StatusBadge tone={phoneVerifiedAt ? "positive" : phone ? "warning" : "neutral"}>
            {phoneVerifiedAt ? copy.phoneVerifiedBadge : phone ? copy.phoneNotVerifiedBadge : copy.phoneNotSetBadge}
          </StatusBadge>
        </div>
      </div>

      <form action="/api/account/preferences" method="post" className="mt-8 divide-y divide-line/70">
        <input
          type="hidden"
          name="preferredPropertyType"
          value={preservedPreferences.preferredPropertyType ?? ""}
        />
        <input
          type="hidden"
          name="preferredRentType"
          value={preservedPreferences.preferredRentType ?? ""}
        />
        <input
          type="hidden"
          name="preferredMinPrice"
          value={preservedPreferences.preferredMinPrice ?? ""}
        />
        <input
          type="hidden"
          name="preferredMaxPrice"
          value={preservedPreferences.preferredMaxPrice ?? ""}
        />

        <div className="pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            {copy.sectionPersonal}
          </p>
          <div className="mt-4">
            <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.name}
            </label>
            <input
              id="profile-name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              defaultValue={name}
              className="input"
            />
          </div>
        </div>

        <div className="space-y-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            {copy.sectionContact}
          </p>

          <div>
            <label htmlFor="profile-phone" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.phone}
            </label>
            <input
              id="profile-phone"
              name="phone"
              defaultValue={phone}
              placeholder="+998901234567"
              className="input"
            />
            {phoneVerifiedAt ? null : (
              <>
                <p className="mt-2 text-xs text-ink/50">{copy.phoneVerifyHint}</p>
                <button
                  type="submit"
                  name="startTelegramVerify"
                  value="1"
                  className="btn-secondary mt-3 w-full"
                >
                  {copy.phoneVerifyButton}
                </button>
              </>
            )}
          </div>

          <div>
            <label htmlFor="profile-telegram" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.telegramUsername}
            </label>
            <input
              id="profile-telegram"
              name="telegramUsername"
              defaultValue={telegramUsername}
              placeholder={copy.telegramPlaceholder}
              className="input"
            />
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            {copy.sectionLocation}
          </p>

          <LocationDetectButton
            regionSelectId="profile-region"
            districtInputId="profile-district"
            regionValues={UZBEKISTAN_REGIONS}
            copy={{
              detect: copy.locationDetect,
              detecting: copy.locationDetecting,
              unsupported: copy.locationUnsupported,
              permissionDenied: copy.locationPermissionDenied,
              failed: copy.locationFailed
            }}
          />

          <LocationSelect
            id="profile-region"
            name="preferredRegion"
            label={copy.region}
            defaultValue={preservedPreferences.preferredRegion ?? undefined}
            options={regionOptions}
            emptyLabel={copy.anyRegion}
          />

          <div>
            <label htmlFor="profile-district" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.district}
            </label>
            <input
              id="profile-district"
              name="preferredDistrict"
              defaultValue={preservedPreferences.preferredDistrict ?? ""}
              placeholder={copy.districtPlaceholder}
              className="input"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {copy.save}
          </button>
        </div>
      </form>
    </section>
  );
}
