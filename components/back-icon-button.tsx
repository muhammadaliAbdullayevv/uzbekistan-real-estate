"use client";

import Link from "next/link";
import { useState } from "react";

type BackIconButtonProps = {
  href: string;
  label: string;
};

export function BackIconButton({ href, label }: BackIconButtonProps) {
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
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-all duration-150 ease-out hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 ${
        isPressed ? "scale-90 bg-blue-50" : "scale-100"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
