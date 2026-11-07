"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

type SmartBackLinkProps = {
  label: string;
  fallbackHref: string;
};

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
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2.5 pr-4 text-sm font-bold text-slate-300 shadow-sm transition-all duration-150 ease-out hover:border-cyan-400/40 hover:bg-white/10 hover:text-white ${
        isPressed ? "scale-95 bg-white/15" : "scale-100"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
