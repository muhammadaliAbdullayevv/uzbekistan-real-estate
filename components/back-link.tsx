"use client";

import Link from "next/link";
import { useState } from "react";

type BackLinkProps = {
  href: string;
  label: string;
};

export function BackLink({ href, label }: BackLinkProps) {
  // CSS :active alone is unreliable on iOS Safari without a touch listener
  // present (same issue already found and fixed on the mobile tab bar) --
  // driven via pointer events instead so the press feedback actually shows
  // up on a real phone, not just in a mouse-hover desktop test.
  const [isPressed, setIsPressed] = useState(false);

  function clearPressed() {
    setIsPressed(false);
  }

  return (
    <Link
      href={href}
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
