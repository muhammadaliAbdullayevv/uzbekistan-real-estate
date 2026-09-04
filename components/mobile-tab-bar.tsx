"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      className="h-5 w-5"
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

export function MobileTabBar({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive ? "text-accent" : "text-ink/50"
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
      </div>
    </nav>
  );
}
