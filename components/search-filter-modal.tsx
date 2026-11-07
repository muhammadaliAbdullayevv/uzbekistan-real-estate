"use client";

import { useState, type ReactNode } from "react";

type SearchFilterModalProps = {
  activeCount: number;
  filterLabel: string;
  children: ReactNode;
};

export function SearchFilterModal({
  activeCount,
  filterLabel,
  children
}: SearchFilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={filterLabel}
        title={filterLabel}
        className={`relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition sm:h-11 sm:px-3.5 ${
          isOpen || activeCount > 0
            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "border-blue-200 bg-[#EFF6FF] text-blue-600 hover:border-blue-300 hover:bg-blue-100"
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
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="16" y2="18" />
          <circle cx="6" cy="6" r="2" />
          <circle cx="14" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
        <span className="hidden sm:inline">{filterLabel}</span>
        {activeCount > 0 ? (
          <span
            className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
              isOpen || activeCount > 0
                ? "bg-white text-blue-700"
                : "bg-blue-600 text-white"
            }`}
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="16" y2="18" />
                    <circle cx="6" cy="6" r="2" />
                    <circle cx="14" cy="12" r="2" />
                    <circle cx="18" cy="18" r="2" />
                  </svg>
                </span>
                <h2 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                  {filterLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-[#F3F6FB] text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="Close"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
