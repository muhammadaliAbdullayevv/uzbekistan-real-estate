"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "welcome-guide-seen";

type WelcomeGuideProps = {
  copy: {
    title: string;
    body: string;
    dismiss: string;
  };
};

export function WelcomeGuide({ copy }: WelcomeGuideProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // Storage unavailable — just skip the guide silently.
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore.
    }
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{copy.title}</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">{copy.body}</p>
        <button type="button" onClick={dismiss} className="btn-primary mt-6 w-full">
          {copy.dismiss}
        </button>
      </div>
    </div>
  );
}
