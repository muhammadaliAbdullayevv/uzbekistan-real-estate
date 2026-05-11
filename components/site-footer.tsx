import Link from "next/link";

import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <footer className="border-t border-line/70 bg-white">
      <div className="shell flex flex-col gap-4 py-8 text-sm text-ink/65 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-ink">{siteConfig.name}</p>
          <p className="mt-1">
            {formatMessage(t.footer.summary, {
              location: t.location.primary
            })}
          </p>
        </div>

        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-ink">
            {t.footer.about}
          </Link>
          <Link href="/contact" className="hover:text-ink">
            {t.footer.contact}
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-ink">
            {t.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
