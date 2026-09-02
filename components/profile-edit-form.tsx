type ProfileEditFormProps = {
  name: string;
  phone: string;
  telegramUsername: string;
  email: string;
  memberSinceValue: string;
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
    description: string;
    name: string;
    phone: string;
    telegramUsername: string;
    telegramPlaceholder: string;
    loggedInAs: string;
    memberSinceLabel: string;
    save: string;
  };
};

export function ProfileEditForm({
  name,
  phone,
  telegramUsername,
  email,
  memberSinceValue,
  preservedPreferences,
  copy
}: ProfileEditFormProps) {
  return (
    <section className="space-y-3 rounded-[24px] border border-line/80 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{copy.title}</p>
        <p className="mt-2 text-sm leading-6 text-ink/62">{copy.description}</p>
      </div>

      <form action="/api/account/preferences" method="post" className="space-y-4">
        <input
          type="hidden"
          name="preferredRegion"
          value={preservedPreferences.preferredRegion ?? ""}
        />
        <input
          type="hidden"
          name="preferredDistrict"
          value={preservedPreferences.preferredDistrict ?? ""}
        />
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

        <button type="submit" className="btn-primary w-full">
          {copy.save}
        </button>
      </form>
    </section>
  );
}
