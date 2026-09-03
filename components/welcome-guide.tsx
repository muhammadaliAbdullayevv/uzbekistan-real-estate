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
      viewBox="0 0 280 150"
      className="mt-4 w-full rounded-[18px] bg-mist"
      aria-hidden="true"
    >
      <rect x="16" y="16" width="248" height="34" rx="17" className="fill-white stroke-line" strokeWidth="1.5" />
      <circle cx="36" cy="33" r="7" className="fill-none stroke-accent" strokeWidth="2.5" />
      <line x1="41" y1="38" x2="46" y2="43" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="56" y="28" width="90" height="10" rx="5" className="fill-line" />
      <rect x="196" y="22" width="52" height="22" rx="11" className="fill-accent" />

      <rect x="16" y="66" width="118" height="68" rx="14" className="fill-white stroke-line" strokeWidth="1.5" />
      <rect x="16" y="66" width="118" height="40" rx="14" className="fill-line" />
      <rect x="28" y="116" width="60" height="8" rx="4" className="fill-line" />
      <rect x="28" y="128" width="36" height="6" rx="3" className="fill-line" />

      <rect x="146" y="66" width="118" height="68" rx="14" className="fill-white stroke-line" strokeWidth="1.5" />
      <rect x="146" y="66" width="118" height="40" rx="14" className="fill-accent/20" />
      <rect x="158" y="116" width="60" height="8" rx="4" className="fill-line" />
      <rect x="158" y="128" width="36" height="6" rx="3" className="fill-line" />
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
