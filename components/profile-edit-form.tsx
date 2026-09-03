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
    title: string;
    name: string;
    phone: string;
    telegramUsername: string;
    telegramPlaceholder: string;
    loggedInAs: string;
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
  };
};

export function ProfileEditForm({
  name,
  phone,
  telegramUsername,
  email,
  avatarUrl,
  memberSinceValue,
  regionOptions,
  preservedPreferences,
  copy
}: ProfileEditFormProps) {
  const initial = (name.trim()[0] || email[0] || "?").toUpperCase();

  return (
    <section className="space-y-4 rounded-[24px] border border-line/80 bg-white p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{copy.title}</p>

      <form action="/api/account/preferences" method="post" className="space-y-4">
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

        <AvatarUpload
          initialUrl={avatarUrl}
          initial={initial}
          copy={{
            change: copy.avatarChange,
            uploading: copy.avatarUploading,
            uploadFailed: copy.avatarUploadFailed
          }}
        />

        <div className="rounded-[18px] bg-mist px-4 py-3 text-sm text-ink/70">
          {copy.loggedInAs} <strong className="text-ink">{email}</strong>
          <br />
          {copy.memberSinceLabel} <strong className="text-ink">{memberSinceValue}</strong>
        </div>

        <div>
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

        <div className="space-y-3 border-t border-line/70 pt-4">
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
        </div>

        <button type="submit" className="btn-primary w-full">
          {copy.save}
        </button>
      </form>
    </section>
  );
}
