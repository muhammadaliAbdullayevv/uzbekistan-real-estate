"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

type SmartBackLinkProps = {
  label: string;
  fallbackHref: string;
};

/**
 * Unlike BackLink (a static href to one fixed destination), this actually
 * returns to whatever page the user came from -- home search results, AI
 * Uychi, near-me results, a favorites-style list, etc. A listing (or
 * add-listing, reachable from several different CTAs) can be reached from
 * many different places, so a single hardcoded destination sent users
 * somewhere they didn't come from.
 *
 * Renders as a real Link to fallbackHref (so middle-click / "open in new
 * tab" still does something sensible) and only intercepts a normal click to
 * go back through real browser history when there's history to go back to.
 */
export function SmartBackLink({ label, fallbackHref }: SmartBackLinkProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  function clearPressed() {
    setIsPressed(false);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={clearPressed}
      onPointerCancel={clearPressed}
      onPointerLeave={clearPressed}
      style={{ WebkitTapHighlightColor: "transparent" }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-white py-1.5 pl-2 pr-3.5 text-sm font-medium text-ink/70 shadow-sm transition-all duration-150 ease-out hover:border-ink/25 hover:text-ink ${
        isPressed ? "scale-95 bg-mist" : "scale-100"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
