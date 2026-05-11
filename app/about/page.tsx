import type { Metadata } from "next";

import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getTranslations(locale);

  return {
    title: t.about.title
  };
}

export default function AboutPage() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <div className="shell py-4">
      <section className="panel max-w-4xl space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.about.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{siteConfig.name}</h1>
        </div>

        <p className="text-base leading-8 text-ink/70">
          {formatMessage(t.about.body1, {
            name: siteConfig.name,
            location: t.location.primary
          })}
        </p>

        <p className="text-base leading-8 text-ink/70">{t.about.body2}</p>
      </section>
    </div>
  );
}
