"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = {
  href: string;
  label: string;
  icon: string;
  showDot?: boolean;
};

function TabIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export const DESKTOP_SIDEBAR_WIDTH = 224;

/**
 * Desktop counterpart to MobileTabBar -- same tabs/highlight/pending-state
 * behavior, laid out as a fixed left rail instead of a bottom bar. Unlike
 * the mobile bar, this one does NOT hide on /ai-uychi or an open /chat/[id]
 * thread: those hide conditions exist on mobile because a full-screen chat
 * takeover is the expected pattern there (and to dodge an on-screen-keyboard
 * desync bug with two fixed-position bars) -- neither reason applies on a
 * desktop viewport with room to spare, where losing all navigation while
 * chatting would just be worse. It still hides on the owner dashboard,
 * same as the mobile bar.
 */
export function DesktopSidebar({ tabs, isAdminPage }: { tabs: Tab[]; isAdminPage: boolean }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  if (isAdminPage) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      style={{ width: DESKTOP_SIDEBAR_WIDTH }}
      className="fixed inset-y-0 left-0 z-20 hidden shrink-0 flex-col gap-1 border-r border-line/70 bg-white/95 p-3 pt-20 backdrop-blur sm:flex md:pt-24"
    >
      {tabs.map((tab) => {
        const currentlyActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const isActive = pendingHref ? tab.href === pendingHref : currentlyActive;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => {
              if (tab.href !== pathname) {
                setPendingHref(tab.href);
              }
            }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "bg-tint text-accent" : "text-ink/60 hover:bg-mist hover:text-ink"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="relative">
              <TabIcon path={tab.icon} />
              {tab.showDot ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-coral"
                />
              ) : null}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
