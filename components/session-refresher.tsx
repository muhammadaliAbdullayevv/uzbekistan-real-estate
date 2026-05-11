"use client";

import { useEffect } from "react";

/**
 * Silently calls /api/auth/refresh-session on every page mount.
 * This refreshes both the browser cookie maxAge and the DB session expiresAt
 * (sliding window), so active users are never unexpectedly logged out.
 * Renders nothing — purely a side-effect component.
 */
export function SessionRefresher() {
  useEffect(() => {
    fetch("/api/auth/refresh-session", { method: "GET" }).catch(() => {
      // Intentionally ignored — user may not be logged in.
    });
  }, []);

  return null;
}
