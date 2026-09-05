"use client";

import Link from "next/link";
import { useState } from "react";

type BackIconButtonProps = {
  href: string;
  label: string;
};

/**
 * The circular icon-only back arrow used in chat-style headers (AI Uychi,
 * a chat thread, the messages inbox). These always go to one fixed,
 * intentional destination (e.g. a thread always returns to the inbox, not
 * wherever the user was before opening it) -- see SmartBackLink for the
 * "return to wherever you actually came from" version used on pages
 * reachable from many different places, like a listing.
 */
export function BackIconButton({ href, label }: BackIconButtonProps) {
  // CSS :active alone is unreliable on iOS Safari without a touch listener
  // present (same issue already found and fixed on the mobile tab bar) --
  // driven via pointer events instead so the press feedback actually shows
  // up on a real phone.
  const [isPressed, setIsPressed] = useState(false);

  function clearPressed() {
    setIsPressed(false);
  }

  return (
    <Link
      href={href}
      aria-label={label}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={clearPressed}
      onPointerCancel={clearPressed}
      onPointerLeave={clearPressed}
      style={{ WebkitTapHighlightColor: "transparent" }}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/70 bg-white text-ink/70 shadow-sm transition-all duration-150 ease-out hover:border-ink/25 hover:text-ink ${
        isPressed ? "scale-90 bg-mist" : "scale-100"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
