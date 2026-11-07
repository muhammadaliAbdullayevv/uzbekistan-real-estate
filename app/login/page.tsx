import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { PasswordInput } from "@/components/password-input";
import { AuthSubmitForm } from "@/components/auth-submit-form";
import { TelegramLoginButton } from "@/components/telegram-login-button";
export { privatePageMetadata as metadata } from "@/lib/site";
import { getLocale, getTranslations } from "@/lib/i18n";
import { resolvePostAuthPath } from "@/lib/owner";
import { getSafeUserNextPath, getUserSession } from "@/lib/user-session";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams = {} }: LoginPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();
  const nextPath = getSafeUserNextPath(
    typeof searchParams.next === "string" ? searchParams.next : "/"
  );

  if (session) {
    redirect(resolvePostAuthPath(session, nextPath));
  }

  const error =
    searchParams.error === "blocked"
      ? t.auth.blocked
      : searchParams.error === "rate-limited"
        ? t.auth.rateLimited
        : searchParams.error === "invalid"
          ? "Login (telefon raqam / @username) yoki parol noto'g'ri kiritildi."
          : searchParams.error === "verify-invalid"
            ? t.auth.verifyEmailInvalid
            : searchParams.error === "google"
              ? t.auth.invalidLogin
              : null;
  const notice =
    searchParams.registered === "1"
      ? t.auth.registeredSuccess
      : searchParams.notice === "password-reset"
        ? t.auth.passwordResetSuccess
        : searchParams.notice === "email-verified"
          ? t.auth.verifiedSuccess
          : null;
  const email = typeof searchParams.email === "string" ? searchParams.email : "";
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? "uychisite_bot").replace(/^@/, "");

  return (
    <AuthShell
      pill="Telegram identifikatsiya va kirish"
      title="Shaxsingizni Telegram orqali tasdiqlang yoki Login va Parol bilan kiring"
      description="Barcha foydalanuvchilar rasmiy Telegram bot orqali telefon raqamini ulashib shaxsini tasdiqlaydi. Bot sizga boshqa qurilma va brauzerlarda kirish uchun shaxsiy Login (+998...) va Parol taqdim etadi."
      primaryFeature={{
        title: "Qanday ishlaydi?",
        copy: "1. Telegram botga o'ting → 2. Telefon raqamingizni ulashing → 3. Saytga avtomatik kiring va Login + Parol oling"
      }}
      secondaryFeatures={[
        {
          title: "Tasdiqlangan profil",
          copy: "Saytda telefon raqamingiz va Telegram ismingiz tasdiqlangan holda ko'rinadi."
        },
        {
          title: "Barcha qurilmalarda",
          copy: "Bot bergan Login (+998...) va Parol orqali kompyuter yoki boshqa brauzerdan bemalol kiring."
        }
      ]}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
            1-usul · Asosiy
          </span>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-[1.65rem]">
            Telegram orqali kirish
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Yangi foydalanuvchilar va tez kirish uchun — bot sizga Login va Parol ham beradi
          </p>
        </div>
      </div>

      <div className="mt-4">
        <TelegramLoginButton
          nextPath={nextPath}
          label="Telegram orqali tasdiqlash va kirish"
        />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Yoki bot bergan Login va Parol bilan
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <AuthSubmitForm action="/api/auth/login" method="post" className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Login (Telefon raqam yoki @username)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              className="input pl-11 font-semibold"
              placeholder="+998901234567 yoki @username"
              defaultValue={email}
            />
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            Telegram bot bergan telefon raqamingiz (`+998...`) yoki `@username`
          </p>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Parol (Bot bergan parol)
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Masalan: uychi48291"
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
            showAriaLabel={t.auth.showPasswordAria}
            hideAriaLabel={t.auth.hidePasswordAria}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {notice}
          </div>
        ) : null}

        <button
          type="submit"
          className="btn-primary w-full py-3.5 text-sm font-extrabold"
        >
          Login va parol bilan kirish
        </button>
      </AuthSubmitForm>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-3.5 text-xs leading-relaxed text-slate-600">
        <p className="font-bold text-slate-800">
          🔑 Parolni unutdingizmi yoki hali Login va Parol olmadingizmi?
        </p>
        <p className="mt-1">
          Yuqoridagi ko&apos;k <strong>«Telegram orqali tasdiqlash va kirish»</strong> tugmasini bosing yoki{" "}
          <a
            href={`https://t.me/${botUsername}?start=parol`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 underline hover:text-blue-700"
          >
            @{botUsername}
          </a>{" "}
          botiga kirib <code>/parol</code> buyrug&apos;ini yuboring.
        </p>
      </div>
    </AuthShell>
  );
}
