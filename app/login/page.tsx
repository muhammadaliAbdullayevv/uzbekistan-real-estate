import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { PasswordInput } from "@/components/password-input";
import { AuthSubmitForm } from "@/components/auth-submit-form";
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
        ? t.auth.invalidLogin
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

  return (
    <AuthShell
      pill={t.auth.loginPill}
      title={t.auth.loginTitle}
      description={t.auth.loginDescription}
      primaryFeature={{
        title: t.auth.featurePrimaryTitle,
        copy: t.auth.featurePrimaryCopy
      }}
      secondaryFeatures={[
        {
          title: t.auth.featureSecurityTitle,
          copy: t.auth.featureSecurityCopy
        },
        {
          title: t.auth.featureSavedTitle,
          copy: t.auth.featureSavedCopy
        }
      ]}
    >
      <div>
        <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
          {t.auth.loginPill}
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
          {t.auth.logIn}
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink/62">{t.auth.loginDescription}</p>
      </div>

      <div className="mt-8">
        <GoogleSignInButton
          nextPath={nextPath}
          label={t.auth.continueWithGoogle}
          dividerLabel={t.auth.orDivider}
        />
      </div>

      <AuthSubmitForm action="/api/auth/login" method="post" className="mt-5 space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink/80">
            {t.auth.email}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">
              @
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              className="input pl-10"
              placeholder="you@example.com"
              defaultValue={email}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink/80">
            {t.auth.password}
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder={t.auth.enterPassword}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
            showAriaLabel={t.auth.showPasswordAria}
            hideAriaLabel={t.auth.hidePasswordAria}
          />
        </div>

        {error ? (
          <div className="rounded-[24px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-ink to-accent px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,118,110,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgba(15,118,110,0.95)]"
        >
          {t.auth.logIn}
        </button>
      </AuthSubmitForm>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-ink/62">
        <Link href="/forgot-password" className="font-medium text-accent">
          {t.auth.forgotPassword}
        </Link>
      </div>

      <p className="mt-5 text-sm text-ink/62">
        {t.auth.noAccountYet}{" "}
        <Link
          href={`/register?next=${encodeURIComponent(nextPath)}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
          className="font-medium text-accent"
        >
          {t.auth.createOne}
        </Link>
      </p>
    </AuthShell>
  );
}
