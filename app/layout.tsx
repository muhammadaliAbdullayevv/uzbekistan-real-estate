import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SessionRefresher } from "@/components/session-refresher";
import { SiteHeader } from "@/components/site-header";
import {
  getLocale,
  getLocaleForOpenGraph,
  getTranslations
} from "@/lib/i18n";
import { getSiteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getTranslations(locale);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`
    },
    description: t.meta.siteDescription,
    applicationName: siteConfig.name,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: siteConfig.name,
      description: t.meta.siteDescription,
      url: "/",
      siteName: siteConfig.name,
      locale: getLocaleForOpenGraph(locale),
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: t.meta.siteDescription
    }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = getLocale();

  return (
    <html lang={locale}>
      <body>
        <SessionRefresher />
        <SiteHeader />
        <main className="pb-20 pt-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
