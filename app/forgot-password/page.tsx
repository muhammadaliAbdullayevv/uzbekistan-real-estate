import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { AuthSubmitForm } from "@/components/auth-submit-form";
export { privatePageMetadata as metadata } from "@/lib/site";
import { getLocale, getTranslations } from "@/lib/i18n";

type ForgotPasswordPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ForgotPasswordPage({ searchParams = {} }: ForgotPasswordPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const sent = searchParams.sent === "1";
  const error =
    searchParams.error === "rate-limited"
      ? t.auth.rateLimited
      : searchParams.error === "delivery"
        ? t.auth.forgotPasswordDeliveryError
        : null;

  return (
    <AuthShell
      pill={t.auth.forgotPasswordTitle}
      title={t.auth.forgotPasswordTitle}
      description={t.auth.forgotPasswordDescription}
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
          {t.auth.forgotPasswordTitle}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-[2.1rem]">
          {t.auth.forgotPasswordTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/62">{t.auth.forgotPasswordDescription}</p>
      </div>

        {sent ? (
          <div className="mt-8 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {t.auth.forgotPasswordSent}
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[24px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        ) : null}

      <AuthSubmitForm
        action="/api/auth/forgot-password"
        method="post"
        className="mt-8 space-y-5"
      >
          <input type="hidden" name="locale" value={locale} />
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
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-ink to-accent px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,118,110,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgba(15,118,110,0.95)]"
          >
            {t.auth.sendResetLink}
          </button>
      </AuthSubmitForm>

      <p className="mt-5 text-sm text-ink/62">
          <Link href="/login" className="font-medium text-accent">
            {t.auth.logIn}
          </Link>
      </p>
    </AuthShell>
  );
}
