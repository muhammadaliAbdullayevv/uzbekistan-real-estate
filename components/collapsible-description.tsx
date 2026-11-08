"use client";

import { useState } from "react";

type CollapsibleDescriptionProps = {
  description: string;
  locale?: "uz" | "ru";
};

export function CollapsibleDescription({
  description,
  locale = "uz"
}: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > 200 || description.split("\n").length > 3;

  const readMoreLabel = locale === "ru" ? "Читать полностью" : "Ko'proq o'qish";
  const showLessLabel = locale === "ru" ? "Свернуть" : "Kamroq ko'rsatish";

  if (!isLong) {
    return (
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {description}
      </p>
    );
  }

  return (
    <div className="relative">
      <div
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={!isExpanded ? "cursor-pointer" : undefined}
      >
        <p
          className={`whitespace-pre-line text-sm leading-relaxed text-slate-700 transition-all ${
            !isExpanded ? "line-clamp-3 select-none" : ""
          }`}
        >
          {description}
        </p>

        {!isExpanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-7 h-12 bg-gradient-to-t from-white via-white/80 to-transparent" />
        ) : null}
      </div>

      <div className="mt-2 pt-0.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 rounded-lg text-xs font-black text-blue-600 transition hover:text-blue-700 hover:underline active:scale-95"
        >
          <span>{isExpanded ? showLessLabel : readMoreLabel}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
