"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  initData?: string;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function TelegramWebAppInit() {
  const router = useRouter();

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();

    try {
      webApp.setHeaderColor("#FFFFFF");
      webApp.setBackgroundColor("#DCE5F2");
    } catch {
      // Unsupported on this Telegram client version -- fine to ignore.
    }

    // Auto-login inside Telegram WebApp using cryptographically verified initData
    const initData = webApp.initData;
    if (initData && !sessionStorage.getItem("tg_webapp_authed")) {
      fetch("/api/auth/telegram/webapp-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            sessionStorage.setItem("tg_webapp_authed", "1");
            router.refresh();
          }
        })
        .catch(() => {
          // Silent fallback -- user can still login manually
        });
    }
  }, [router]);

  return null;
}
