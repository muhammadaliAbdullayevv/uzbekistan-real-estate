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

type RegisterPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function RegisterPage({ searchParams = {} }: RegisterPageProps) {
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
    searchParams.error === "exists"
      ? t.auth.accountExists
      : searchParams.error === "rate-limited"
        ? t.auth.rateLimited
      : searchParams.error === "password-short"
        ? t.auth.passwordTooShort
      : searchParams.error === "password-mismatch"
        ? t.auth.passwordMismatch
      : searchParams.error === "terms"
        ? t.auth.termsRequired
      : searchParams.error === "invalid"
        ? t.auth.fillFormCorrectly
        : null;

  const prefilledEmail = typeof searchParams.email === "string" ? searchParams.email : "";
  const prefilledName = typeof searchParams.name === "string" ? searchParams.name : "";
  const prefilledPhone = typeof searchParams.phone === "string" ? searchParams.phone : "";

  return (
    <AuthShell
      pill={t.auth.registerPill}
      title={t.auth.registerTitle}
      description={t.auth.registerDescription}
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
          {t.auth.registerPill}
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
          {t.auth.createAccount}
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink/62">{t.auth.registerDescription}</p>
      </div>

      <div className="mt-8">
        <GoogleSignInButton
          nextPath={nextPath}
          label={t.auth.continueWithGoogle}
          dividerLabel={t.auth.orDivider}
        />
      </div>

      <AuthSubmitForm action="/api/auth/register" method="post" className="mt-5 space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink/80">
            {t.auth.fullName}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="input"
            placeholder={t.auth.noAccountNamePlaceholder}
            defaultValue={prefilledName}
          />
        </div>

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
              defaultValue={prefilledEmail}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink/80">
            {t.auth.phoneOptional}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            minLength={7}
            className="input"
            placeholder="+998901234567"
            defaultValue={prefilledPhone}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink/80">
            {t.auth.password}
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder={t.auth.strongPasswordPlaceholder}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
            showAriaLabel={t.auth.showPasswordAria}
            hideAriaLabel={t.auth.hidePasswordAria}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-ink/80"
          >
            {t.auth.confirmPassword}
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder={t.auth.confirmPasswordPlaceholder}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
            showAriaLabel={t.auth.showPasswordAria}
            hideAriaLabel={t.auth.hidePasswordAria}
          />
        </div>

        <label className="flex items-start gap-3 rounded-[24px] border border-line/80 bg-mist/45 px-4 py-4 text-sm leading-6 text-ink/72">
          <input
            type="checkbox"
            name="acceptedTerms"
            required
            className="mt-1 h-4 w-4 rounded border-line text-accent focus:ring-accent/20"
          />
          <span>
            {t.auth.acceptTermsPrefix}
            <Link href="/privacy" className="font-medium text-accent">
              {t.auth.acceptTermsPrivacy}
            </Link>
            {t.auth.acceptTermsMiddle}
            <Link href="/terms" className="font-medium text-accent">
              {t.auth.acceptTermsTerms}
            </Link>
            {t.auth.acceptTermsSuffix}
          </span>
        </label>

        {error ? (
          <div className="rounded-[24px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-ink to-accent px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,118,110,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgba(15,118,110,0.95)]"
        >
          {t.auth.createAccount}
        </button>
      </AuthSubmitForm>

      <p className="mt-5 text-sm text-ink/62">
        {t.auth.alreadyRegistered}{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`}
          className="font-medium text-accent"
        >
          {t.auth.logIn}
        </Link>
      </p>
    </AuthShell>
  );
}
