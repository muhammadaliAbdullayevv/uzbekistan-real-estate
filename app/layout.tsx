import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteFooter } from "@/components/site-footer";
import { SessionRefresher } from "@/components/session-refresher";
import { SiteHeader } from "@/components/site-header";
import { hasUnreadMessages } from "@/lib/conversations";
import {
  getLocale,
  getLocaleForOpenGraph,
  getTranslations
} from "@/lib/i18n";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { getUserSession } from "@/lib/user-session";

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
  const t = getTranslations(locale);
  const session = await getUserSession();
  const hasUnread = session ? await hasUnreadMessages(session.userId) : false;

  const tabs = [
    {
      href: "/",
      label: t.nav.listings,
      icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
    },
    {
      href: "/add-listing",
      label: t.nav.addListing,
      icon: "M12 5v14M5 12h14"
    },
    {
      href: "/favorites",
      label: t.nav.saved,
      icon: "m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
    },
    {
      href: "/chat",
      label: t.nav.chat,
      icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
      showDot: hasUnread
    }
  ];

  return (
    <html lang={locale}>
      <body>
        <SessionRefresher />
        <SiteHeader />
        <main className="pb-24 pt-8 sm:pb-20">{children}</main>
        <SiteFooter />
        <MobileTabBar tabs={tabs} />
      </body>
    </html>
  );
}
