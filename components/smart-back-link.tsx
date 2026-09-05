"use client";

import { useRouter } from "next/navigation";

type SmartBackLinkProps = {
  label: string;
  fallbackHref: string;
};

/**
 * Unlike BackLink (a static href to one fixed destination), this actually
 * returns to whatever page the user came from -- home search results, AI
 * Uychi, near-me results, a favorites-style list, etc. A listing can be
 * reached from many different places, so a single hardcoded destination
 * (e.g. always "/") sent users somewhere they didn't come from. Falls back
 * to fallbackHref only when there's no in-app history to go back to (a
 * shared link opened directly).
 */
export function SmartBackLink({ label, fallbackHref }: SmartBackLinkProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center text-sm font-medium text-accent"
    >
      {label}
    </button>
  );
}
