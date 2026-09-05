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

export function HideFooterOnChatRoutes({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hide = HIDDEN_ON.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (hide) {
    return null;
  }

  return <>{children}</>;
}
