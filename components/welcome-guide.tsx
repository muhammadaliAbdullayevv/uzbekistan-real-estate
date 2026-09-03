"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "welcome-guide-seen-v2";

type Step = 1 | 2 | 3;
type Stage = Step | "profile-cta";

type StepCopy = { title: string; body: string };

type WelcomeGuideProps = {
  copy: {
    steps: [StepCopy, StepCopy, StepCopy];
    next: string;
    finish: string;
    profileCtaTitle: string;
    profileCtaBody: string;
    profileCtaButton: string;
    profileCtaSkip: string;
  };
};

function SearchIllustration() {
  return (
    <svg
      viewBox="0 0 280 170"
      className="mt-4 w-full rounded-[18px] bg-mist"
      aria-hidden="true"
    >
      {/* Search bar */}
      <rect x="14" y="14" width="252" height="32" rx="16" className="fill-white stroke-line" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="6" className="fill-none stroke-accent" strokeWidth="2.2" />
      <line x1="36.5" y1="34.5" x2="41" y2="39" className="stroke-accent" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="50" y="25" width="80" height="9" rx="4.5" className="fill-ink/15" />
      <rect x="190" y="19" width="60" height="21" rx="10.5" className="fill-accent" />
      <rect x="202" y="27" width="36" height="6" rx="3" className="fill-white/85" />

      {/* Card 1 */}
      <rect x="14" y="58" width="122" height="98" rx="14" className="fill-white stroke-line" strokeWidth="1.5" />
      <rect x="14" y="58" width="122" height="56" rx="14" className="fill-mist" />
      <path d="M28 96 40 84 52 96 52 102 44 102 44 90 32 90 32 102 28 102Z" className="fill-ink" />
      <circle cx="112" cy="72" r="7" className="fill-saffron" />
      <rect x="22" y="100" width="46" height="14" rx="7" className="fill-ink" />
      <rect x="22" y="123" width="52" height="7" rx="3.5" className="fill-ink/70" />
      <rect x="22" y="135" width="72" height="6" rx="3" className="fill-ink/35" />
      <rect x="22" y="145" width="36" height="8" rx="4" className="fill-accent/15" />

      {/* Card 2 */}
      <rect x="144" y="58" width="122" height="98" rx="14" className="fill-white stroke-line" strokeWidth="1.5" />
      <rect x="144" y="58" width="122" height="56" rx="14" className="fill-accent/15" />
      <path d="M158 96 170 84 182 96 182 102 174 102 174 90 162 90 162 102 158 102Z" className="fill-accent" />
      <circle cx="242" cy="72" r="7" className="fill-saffron" />
      <rect x="152" y="100" width="46" height="14" rx="7" className="fill-ink" />
      <rect x="152" y="123" width="58" height="7" rx="3.5" className="fill-ink/70" />
      <rect x="152" y="135" width="66" height="6" rx="3" className="fill-ink/35" />
      <rect x="152" y="145" width="36" height="8" rx="4" className="fill-accent/15" />
    </svg>
  );
}

export function WelcomeGuide({ copy }: WelcomeGuideProps) {
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setStage(1);
      }
    } catch {
      // Storage unavailable — just skip the guide silently.
    }
  }, []);

  useEffect(() => {
    if (!stage) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stage]);

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore.
    }
  }

  function close() {
    markSeen();
    setStage(null);
  }

  if (!stage) {
    return null;
  }

  const isGuideStep = stage === 1 || stage === 2 || stage === 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={isGuideStep ? undefined : close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {isGuideStep ? (
          <>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`h-1.5 flex-1 rounded-full ${
                    dot <= stage ? "bg-accent" : "bg-line"
                  }`}
                />
              ))}
            </div>

            <h2 className="mt-5 font-display text-xl font-semibold text-ink sm:text-2xl">
              {copy.steps[stage - 1].title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">{copy.steps[stage - 1].body}</p>

            {stage === 2 ? <SearchIllustration /> : null}

            <button
              type="button"
              onClick={() => (stage === 3 ? setStage("profile-cta") : setStage((stage + 1) as Step))}
              className="btn-primary mt-6 w-full"
            >
              {stage === 3 ? copy.finish : copy.next}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              {copy.profileCtaTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">{copy.profileCtaBody}</p>

            <Link href="/account" onClick={markSeen} className="btn-primary mt-6 block w-full text-center">
              {copy.profileCtaButton}
            </Link>
            <button type="button" onClick={close} className="mt-3 w-full text-center text-sm font-medium text-ink/50">
              {copy.profileCtaSkip}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
