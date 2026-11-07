import Link from "next/link";

import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <footer className="border-t border-slate-200/90 bg-white">
      <div className="shell flex flex-col gap-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display font-extrabold text-slate-900">
            {siteConfig.name.toUpperCase()}
            <span className="text-blue-600">.UZ</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {formatMessage(t.footer.summary, {
              location: t.location.primary
            })}
          </p>
        </div>

        <nav className="flex flex-wrap gap-5 text-xs font-bold text-slate-600 sm:text-sm">
          <Link href="/about" className="hover:text-blue-600">
            {t.footer.about}
          </Link>
          <Link href="/contact" className="hover:text-blue-600">
            {t.footer.contact}
          </Link>
          <Link href="/privacy" className="hover:text-blue-600">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-blue-600">
            {t.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
