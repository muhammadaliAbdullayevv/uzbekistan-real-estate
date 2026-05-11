import type { Metadata } from "next";

import { getLocale, getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getTranslations(locale);

  return {
    title: t.terms.title
  };
}

export default function TermsPage() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <div className="shell py-4">
      <section className="panel max-w-4xl space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.terms.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{t.terms.title}</h1>
        </div>

        <p className="text-base leading-8 text-ink/70">{t.terms.body1}</p>

        <p className="text-base leading-8 text-ink/70">{t.terms.body2}</p>

        <p className="text-base leading-8 text-ink/70">{t.terms.body3}</p>
      </section>
    </div>
  );
}
