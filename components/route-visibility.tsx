"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Full-screen chat-style pages (AI Uychi, the messages inbox and its
// threads) are focused utility screens, not browsing pages -- the site's
// marketing footer (tagline + About/Contact/Privacy/Terms links) doesn't
// belong there. This wraps SiteFooter (a Server Component, so it can't read
// the route itself) instead of duplicating its data-fetching in a client
// version.
const HIDDEN_ON = ["/ai-uychi", "/chat"];

export function HideFooterOnChatRoutes({
  children,
  isAdminPage
}: {
  children: ReactNode;
  isAdminPage: boolean;
}) {
  const pathname = usePathname();
  // isAdminPage comes from a header middleware sets (see app/layout.tsx),
  // not a pathname check -- see the comment in mobile-tab-bar.tsx for why a
  // literal "/admin" pathname check doesn't work once ADMIN_PATH is set.
  const hide = isAdminPage || HIDDEN_ON.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (hide) {
    return null;
  }

  return <>{children}</>;
}
