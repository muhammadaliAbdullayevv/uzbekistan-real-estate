import { AvatarUpload } from "@/components/avatar-upload";

type ProfileMastheadProps = {
  name: string;
  email: string;
  phone: string;
  telegramUsername?: string | null;
  telegramChatId?: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  copy: {
    avatarChange: string;
    avatarUploading: string;
    avatarUploadFailed: string;
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
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] ${toneClasses}`}
    >
      {tone === "positive" ? <CheckIcon /> : null}
      {children}
    </span>
  );
}

export function ProfileMasthead({
  name,
  email,
  phone,
  telegramUsername,
  telegramChatId,
  avatarUrl,
  emailVerifiedAt,
  phoneVerifiedAt,
  copy
}: ProfileMastheadProps) {
  const isSyntheticEmail = email.endsWith(".local");
  const displaySubtitle = phone || (telegramUsername ? `@${telegramUsername}` : !isSyntheticEmail ? email : "");
  const initial = (name.trim()[0] || (telegramUsername ? telegramUsername[0] : "") || email[0] || "U").toUpperCase();

  return (
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
          <p className="truncate font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
            {name || displaySubtitle || "Foydalanuvchi"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
            {phone ? <span>{phone}</span> : null}
            {telegramUsername ? (
              <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                @{telegramUsername}
              </span>
            ) : null}
            {!isSyntheticEmail && email ? (
              <span className="truncate text-xs text-slate-500">{email}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
        <StatusBadge tone={telegramChatId || phoneVerifiedAt ? "positive" : "neutral"}>
          {telegramChatId || phoneVerifiedAt ? "Telegram tasdiqlangan" : "Telegram ulanmagan"}
        </StatusBadge>
        <StatusBadge tone={phoneVerifiedAt ? "positive" : phone ? "warning" : "neutral"}>
          {phoneVerifiedAt ? copy.phoneVerifiedBadge : phone ? copy.phoneNotVerifiedBadge : copy.phoneNotSetBadge}
        </StatusBadge>
        {!isSyntheticEmail ? (
          <StatusBadge tone={emailVerifiedAt ? "positive" : "warning"}>
            {emailVerifiedAt ? copy.emailVerifiedBadge : copy.emailNotVerifiedBadge}
          </StatusBadge>
        ) : null}
      </div>
    </div>
  );
}
