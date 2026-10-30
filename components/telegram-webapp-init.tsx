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

/**
 * No-ops outside Telegram's in-app browser -- window.Telegram is only ever
 * set when the SDK script (loaded in layout.tsx) is actually running inside
 * a Telegram Web App webview, so this is safe to mount on every page for
 * every visitor, not just ones who arrived via Telegram.
 */
export function TelegramWebAppInit() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();

    // Matches the header's ink background and the page's white body
    // (app/globals.css) so Telegram's own chrome doesn't clash with the
    // page. Older Telegram client versions reject an arbitrary hex here
    // (only theme-preset keywords), so this is best-effort, not required
    // for the webview to work.
    try {
      webApp.setHeaderColor("#12202F");
      webApp.setBackgroundColor("#FFFFFF");
    } catch {
      // Unsupported on this Telegram client version -- fine to ignore.
    }
  }, []);

  return null;
}
