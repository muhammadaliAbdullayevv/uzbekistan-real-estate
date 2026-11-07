import Link from "next/link";

import { ProfileMasthead } from "@/components/profile-masthead";

type ProfileSummaryProps = {
  name: string;
  email: string;
  phone: string;
  telegramUsername?: string | null;
  telegramChatId?: string | null;
  botUsername?: string;
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
  telegramUsername,
  telegramChatId,
  botUsername = "uychisite_bot",
  avatarUrl,
  emailVerifiedAt,
  phoneVerifiedAt,
  regionLabel,
  district,
  copy
}: ProfileSummaryProps) {
  const loginValue = phone || (telegramUsername ? `@${telegramUsername}` : email);

  return (
    <section className="panel p-6 sm:p-8">
      <ProfileMasthead
        name={name}
        email={email}
        phone={phone}
        telegramUsername={telegramUsername}
        telegramChatId={telegramChatId}
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

      <div className="mt-6 divide-y divide-slate-200/80 text-sm">
        <div className="flex items-center justify-between py-3">
          <span className="font-medium text-slate-500">Ism va familiya (Telegram)</span>
          <span className="font-bold text-slate-900">{name || copy.notSet}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="font-medium text-slate-500">{copy.phoneRowLabel} (Login)</span>
          <span className="font-extrabold text-blue-700">{phone || copy.notSet}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="font-medium text-slate-500">Telegram profil</span>
          <span className="font-bold text-slate-900">
            {telegramUsername ? `@${telegramUsername}` : telegramChatId ? "Telegram ulangan" : copy.notSet}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="font-medium text-slate-500">{copy.regionRowLabel}</span>
          <span className="font-bold text-slate-900">{regionLabel || copy.notSet}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="font-medium text-slate-500">{copy.districtRowLabel}</span>
          <span className="font-bold text-slate-900">{district || copy.notSet}</span>
        </div>
      </div>

      {/* Credentials block for logging in on other devices/browsers */}
      <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              🔑 Boshqa qurilma va brauzerda kirish
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Kompyuter yoki boshqa telefondan kirish uchun sizning Loginingiz:
            </p>
          </div>
          <span className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 font-mono text-sm font-extrabold text-slate-900 shadow-sm">
            {loginValue}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-blue-200/70 pt-3 text-xs text-slate-600">
          <span>Parolingiz Telegram bot orqali yuborilgan.</span>
          <a
            href={`https://t.me/${botUsername}?start=parol`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-blue-700"
          >
            Telegramdan yangi parol olish →
          </a>
        </div>
      </div>

      <Link href="/account?edit=1" className="btn-secondary mt-5 w-full">
        {copy.editButton}
      </Link>
    </section>
  );
}
