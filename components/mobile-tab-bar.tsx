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
  // Set the instant a tab is tapped so the highlight moves right away,
  // rather than waiting for the (sometimes slow, force-dynamic) page to
  // actually finish loading before usePathname() catches up.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  // CSS :active is unreliable on iOS Safari without a touch listener
  // present, which is why taps gave no feedback at all — driven via
  // pointer events instead so the press state is consistent everywhere.
  const [pressedHref, setPressedHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  function clearPressed(href: string) {
    setPressedHref((current) => (current === href ? null : current));
  }

  // AI Uychi and an open buyer/owner chat thread are full-screen chats,
  // like Telegram/WhatsApp -- no persistent nav bar while one is open.
  // (The /chat inbox list itself keeps the nav, same as Telegram's own
  // chat list does.) Keeping it around also caused a real bug: with both
  // this (fixed bottom-0) and the chat's own input bar fixed-positioned,
  // opening the on-screen keyboard on Android desynced them, leaving this
  // bar floating above the keyboard with a gap beneath it.
  // The owner control panel is a moderation tool, not a browsing screen --
  // the consumer tab bar (listings/add/AI Uychi/messages/account) doesn't
  // belong there either.
  if (pathname === "/ai-uychi" || pathname.startsWith("/chat/") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const currentlyActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const isActive = pendingHref ? tab.href === pendingHref : currentlyActive;
          const isPressed = pressedHref === tab.href;

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
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-all duration-150 ease-out ${
                isActive ? "text-accent" : "text-ink/50"
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
