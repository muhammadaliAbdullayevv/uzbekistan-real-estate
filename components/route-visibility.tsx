"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Full-screen chat-style pages (AI Uychi, the messages inbox and its
// threads) are focused utility screens, not browsing pages -- the site's
// marketing footer (tagline + About/Contact/Privacy/Terms links) doesn't
// belong there. This wraps SiteFooter (a Server Component, so it can't read
// the route itself) instead of duplicating its data-fetching in a client
// version.
const HIDDEN_ON = [
  "/ai-uychi",
  "/add-listing",
  "/listings",
  "/chat",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password"
];

export function HideFooterOnChatRoutes({
  children,
  isAdminPage
}: {
  children: ReactNode;
  isAdminPage: boolean;
}) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const hide =
    isAdminPage ||
    HIDDEN_ON.some(
      (route) => currentPath === route || currentPath.startsWith(`${route}/`)
    );

  if (hide) {
    return null;
  }

  return <>{children}</>;
}
