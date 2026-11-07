import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthSubmitForm } from "@/components/auth-submit-form";
import { PasswordInput } from "@/components/password-input";
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
  const botUsername = (process.env.TELEGRAM_BOT_USERNAME ?? "HousliBot").replace(/^@/, "");

  return (
    <div className="shell py-6 sm:py-12">
      <div className="mx-auto max-w-md">
        <div className="panel overflow-hidden border border-slate-200/90 bg-white p-6 shadow-soft sm:rounded-[32px] sm:p-8">
          {/* Header */}
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white shadow-md shadow-blue-600/25">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Tizimga kirish
            </h1>
            <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">
              Telefon raqamingiz va parolingiz bilan kiring
            </p>
          </div>

          {/* Login Form */}
          <AuthSubmitForm action="/api/auth/login" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="next" value={nextPath} />

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Telefon raqami (Login)
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
                  placeholder="+998 90 123 45 67 yoki @username"
                  defaultValue={email}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Parol
                </label>
                <a
                  href={`https://t.me/${botUsername}?start=parol`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Parolni unutdingizmi?
                </a>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Parolingizni kiriting"
                showLabel={t.auth.showPassword}
                hideLabel={t.auth.hidePassword}
                showAriaLabel={t.auth.showPasswordAria}
                hideAriaLabel={t.auth.hidePasswordAria}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                {notice}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-sm font-extrabold shadow-md shadow-blue-600/20"
            >
              Kirish
            </button>
          </AuthSubmitForm>

          {/* Create Account via Telegram Bot */}
          <div className="mt-8 border-t border-slate-200/80 pt-6">
            <p className="text-center text-xs font-medium text-slate-500">
              Hisobingiz yo&apos;qmi?
            </p>

            <a
              href={`https://t.me/${botUsername}?start=register`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-blue-200 bg-[#EFF6FF] px-4 py-3.5 text-sm font-extrabold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100/70"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <span>Telegram orqali hisob yaratish</span>
            </a>

            <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
              Botda telefon raqamingizni ulashib 5 soniyada Login va Parol olasiz
            </p>
          </div>

          {/* Alternative 1-Tap Browser Login (Optional Accordion / Subtle link) */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <details className="group">
              <summary className="cursor-pointer list-none text-xs font-bold text-slate-500 hover:text-blue-600">
                <span>⚡ Telegram orqali 1-bosishda tez kirish</span>
              </summary>
              <div className="mt-3">
                <TelegramLoginButton
                  nextPath={nextPath}
                  label="Telegram orqali to'g'ridan-to'g'ri kirish"
                />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
