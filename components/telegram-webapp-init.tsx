"use client";

import { useEffect } from "react";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function TelegramWebAppInit() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();

    try {
      webApp.setHeaderColor("#090C10");
      webApp.setBackgroundColor("#06080B");
    } catch {
      // Unsupported on this Telegram client version -- fine to ignore.
    }
  }, []);

  return null;
}
