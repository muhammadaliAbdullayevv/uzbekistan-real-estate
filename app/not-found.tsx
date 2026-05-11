import Link from "next/link";

import { getLocale, getTranslations } from "@/lib/i18n";

export default function NotFound() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center">
      <div className="panel max-w-xl space-y-5 p-8 text-center">
        <span className="pill border-accent/25 bg-accent/5 text-accent">404</span>
        <h1 className="font-display text-4xl font-semibold text-ink">{t.notFound.title}</h1>
        <p className="text-base leading-7 text-ink/70">{t.notFound.description}</p>
        <Link href="/" className="btn-primary">
          {t.notFound.returnHome}
        </Link>
      </div>
    </div>
  );
}
