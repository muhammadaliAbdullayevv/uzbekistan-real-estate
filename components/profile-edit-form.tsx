import { LocationDetectButton } from "@/components/location-detect-button";
import { LocationSelect } from "@/components/location-select";
import { ProfileMasthead } from "@/components/profile-masthead";
import { UZBEKISTAN_REGIONS } from "@/lib/locations";

type ProfileEditFormProps = {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
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
    locationDetectHint: string;
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

function stripUzPrefix(phone: string) {
  return phone.startsWith("+998") ? phone.slice(4) : phone;
}

export function ProfileEditForm({
  name,
  phone,
  email,
  avatarUrl,
  emailVerifiedAt,
  phoneVerifiedAt,
  regionOptions,
  preservedPreferences,
  copy
}: ProfileEditFormProps) {
  return (
    <section className="panel p-6 sm:p-8">
      <ProfileMasthead
        name={name}
        email={email}
        phone={phone}
        avatarUrl={avatarUrl}
        emailVerifiedAt={emailVerifiedAt}
        phoneVerifiedAt={phoneVerifiedAt}
        copy={{
          avatarChange: copy.avatarChange,
          avatarUploading: copy.avatarUploading,
          avatarUploadFailed: copy.avatarUploadFailed,
          emailVerifiedBadge: copy.emailVerifiedBadge,
          emailNotVerifiedBadge: copy.emailNotVerifiedBadge,
          phoneVerifiedBadge: copy.phoneVerifiedBadge,
          phoneNotVerifiedBadge: copy.phoneNotVerifiedBadge,
          phoneNotSetBadge: copy.phoneNotSetBadge
        }}
      />

      <form action="/api/account/preferences" method="post" className="mt-6 divide-y divide-line/70">
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

        <div className="pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            {copy.sectionPersonal}
          </p>
          <div className="mt-3">
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

        <div className="space-y-3 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            {copy.sectionContact}
          </p>

          <div>
            <label htmlFor="profile-phone" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.phone}
            </label>
            <div className="flex items-stretch overflow-hidden rounded-2xl border border-line bg-white transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
              <span className="flex items-center border-r border-line bg-mist px-4 text-sm font-medium text-ink/60">
                +998
              </span>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{9}"
                maxLength={9}
                defaultValue={stripUzPrefix(phone)}
                placeholder="901234567"
                className="h-12 w-full flex-1 border-0 bg-transparent px-4 text-sm text-ink outline-none"
              />
            </div>
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
        </div>

        <div className="space-y-3 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            {copy.sectionLocation}
          </p>

          <div>
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
            <p className="mt-1.5 text-xs text-ink/45">{copy.locationDetectHint}</p>
          </div>

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
