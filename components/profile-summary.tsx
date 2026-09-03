import Link from "next/link";

import { ProfileMasthead } from "@/components/profile-masthead";

type ProfileSummaryProps = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  regionLabel: string | null;
  district: string | null;
  copy: {
    avatarChange: string;
    avatarUploading: string;
    avatarUploadFailed: string;
    emailVerifiedBadge: string;
    emailNotVerifiedBadge: string;
    phoneVerifiedBadge: string;
    phoneNotVerifiedBadge: string;
    phoneNotSetBadge: string;
    phoneRowLabel: string;
    regionRowLabel: string;
    districtRowLabel: string;
    notSet: string;
    editButton: string;
  };
};

export function ProfileSummary({
  name,
  email,
  phone,
  avatarUrl,
  emailVerifiedAt,
  phoneVerifiedAt,
  regionLabel,
  district,
  copy
}: ProfileSummaryProps) {
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

      <div className="mt-6 divide-y divide-line/70 text-sm">
        <div className="flex items-center justify-between py-3">
          <span className="text-ink/50">{copy.phoneRowLabel}</span>
          <span className="font-medium text-ink">{phone || copy.notSet}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-ink/50">{copy.regionRowLabel}</span>
          <span className="font-medium text-ink">{regionLabel || copy.notSet}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-ink/50">{copy.districtRowLabel}</span>
          <span className="font-medium text-ink">{district || copy.notSet}</span>
        </div>
      </div>

      <Link href="/account?edit=1" className="btn-secondary mt-6 w-full">
        {copy.editButton}
      </Link>
    </section>
  );
}
