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
      className="fixed inset-y-0 left-0 z-20 hidden shrink-0 flex-col gap-1.5 border-r border-white/10 bg-[#090C10]/95 p-3 pt-20 backdrop-blur-xl sm:flex md:pt-24"
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
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all ${
              isActive
                ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 to-teal-500/10 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
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
