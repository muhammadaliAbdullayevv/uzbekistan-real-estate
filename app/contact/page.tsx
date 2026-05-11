import type { Metadata } from "next";

import { getLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getTranslations(locale);

  return {
    title: t.contact.title
  };
}

export default function ContactPage() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <div className="shell py-4">
      <section className="panel max-w-4xl space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.contact.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{t.contact.title}</h1>
        </div>

        <p className="text-base leading-8 text-ink/70">{t.contact.intro}</p>

        <div className="rounded-[24px] border border-line bg-mist/70 p-5 text-base text-ink">
          <a href={`mailto:${siteConfig.contactEmail}`} className="font-medium hover:text-accent">
            {siteConfig.contactEmail}
          </a>
        </div>

        <p className="text-sm leading-7 text-ink/60">
          {t.contact.note}
        </p>
      </section>
    </div>
  );
}
