"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = {
  href: string;
  label: string;
  icon: string;
  showDot?: boolean;
  elevated?: boolean;
};

function TabIcon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
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

export function MobileTabBar({ tabs, isAdminPage }: { tabs: Tab[]; isAdminPage: boolean }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pressedHref, setPressedHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  function clearPressed(href: string) {
    setPressedHref((current) => (current === href ? null : current));
  }

  if (pathname === "/ai-uychi" || pathname.startsWith("/chat/") || isAdminPage) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:hidden"
    >
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const currentlyActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const isActive = pendingHref ? tab.href === pendingHref : currentlyActive;
          const isPressed = pressedHref === tab.href;

          if (tab.elevated) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => {
                  if (tab.href !== pathname) {
                    setPendingHref(tab.href);
                  }
                }}
                onPointerDown={() => setPressedHref(tab.href)}
                onPointerUp={() => clearPressed(tab.href)}
                onPointerCancel={() => clearPressed(tab.href)}
                onPointerLeave={() => clearPressed(tab.href)}
                style={{ WebkitTapHighlightColor: "transparent" }}
                className="relative flex flex-1 flex-col items-center justify-end pb-2"
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
              >
                <span
                  className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_10px_24px_-6px_rgba(37,99,235,0.5)] ring-4 ring-white transition-transform duration-150 ease-out ${
                    isPressed ? "scale-90" : "scale-100"
                  }`}
                >
                  <TabIcon path={tab.icon} className="h-6 w-6" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => {
                if (tab.href !== pathname) {
                  setPendingHref(tab.href);
                }
              }}
              onPointerDown={() => setPressedHref(tab.href)}
              onPointerUp={() => clearPressed(tab.href)}
              onPointerCancel={() => clearPressed(tab.href)}
              onPointerLeave={() => clearPressed(tab.href)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-all duration-150 ease-out ${
                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
              } ${isPressed ? "scale-90 opacity-70" : "scale-100"}`}
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
      </div>
    </nav>
  );
}
