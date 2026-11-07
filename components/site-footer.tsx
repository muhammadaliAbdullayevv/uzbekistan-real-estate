import Link from "next/link";

import { formatMessage, getLocale, getTranslations } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const locale = getLocale();
  const t = getTranslations(locale);

  return (
    <footer className="border-t border-white/10 bg-[#080B10]">
      <div className="shell flex flex-col gap-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display font-bold text-white">
            {siteConfig.name.toUpperCase()}
            <span className="text-cyan-400">.UZ</span>
          </p>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {formatMessage(t.footer.summary, {
              location: t.location.primary
            })}
          </p>
        </div>

        <nav className="flex flex-wrap gap-5 text-xs font-semibold sm:text-sm">
          <Link href="/about" className="hover:text-cyan-400">
            {t.footer.about}
          </Link>
          <Link href="/contact" className="hover:text-cyan-400">
            {t.footer.contact}
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-cyan-400">
            {t.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
