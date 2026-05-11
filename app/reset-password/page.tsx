import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitForm } from "@/components/auth-submit-form";
import { PasswordInput } from "@/components/password-input";
import { getUserTokenStatus } from "@/lib/user-tokens";

export { privatePageMetadata as metadata } from "@/lib/site";
import { getLocale, getLocaleFromValue, getTranslations } from "@/lib/i18n";

type ResetPasswordPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ResetPasswordPage({ searchParams = {} }: ResetPasswordPageProps) {
  const locale = getLocaleFromValue(
    typeof searchParams.locale === "string" ? searchParams.locale : getLocale()
  );
  const t = getTranslations(locale);
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  const tokenStatus = token ? await getUserTokenStatus(token, "RESET_PASSWORD") : { valid: false };

  return (
    <AuthShell
      pill={t.auth.resetPasswordTitle}
      title={t.auth.resetPasswordTitle}
      description={t.auth.resetPasswordDescription}
      primaryFeature={{
        title: t.auth.recoveryFeatureTitle,
        copy: t.auth.recoveryFeatureCopy
      }}
      secondaryFeatures={[
        {
          title: t.auth.recoverySupportTitle,
          copy: t.auth.recoverySupportCopy
        },
        {
          title: t.auth.featureSecurityTitle,
          copy: t.auth.featureSecurityCopy
        }
      ]}
    >
      <div>
        <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
          {t.auth.resetPasswordTitle}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
          {t.auth.resetPasswordTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/62">{t.auth.resetPasswordDescription}</p>
      </div>

        {!tokenStatus.valid ? (
          <div className="mt-8 rounded-[24px] border border-coral/20 bg-coral/10 px-4 py-4 text-sm text-coral">
            <p>{t.auth.invalidOrExpiredToken}</p>
            <div className="mt-3">
              <Link href="/forgot-password" className="font-medium text-accent">
                {t.auth.sendResetLink}
              </Link>
            </div>
          </div>
        ) : (
          <AuthSubmitForm
            action="/api/auth/reset-password"
            method="post"
            className="mt-8 space-y-5"
          >
            <input type="hidden" name="token" value={token} />

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink/80">
                {t.auth.password}
              </label>
              <PasswordInput
                id="password"
                name="password"
                minLength={8}
                required
                placeholder={t.auth.strongPasswordPlaceholder}
                showLabel={t.auth.showPassword}
                hideLabel={t.auth.hidePassword}
                showAriaLabel={t.auth.showPasswordAria}
                hideAriaLabel={t.auth.hidePasswordAria}
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-ink to-accent px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,118,110,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgba(15,118,110,0.95)]"
            >
              {t.auth.resetPassword}
            </button>
          </AuthSubmitForm>
        )}

      <p className="mt-5 text-sm text-ink/62">
        <Link href="/login" className="font-medium text-accent">
          {t.auth.logIn}
        </Link>
      </p>
    </AuthShell>
  );
}
