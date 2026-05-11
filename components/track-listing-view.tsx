"use client";

import { useEffect } from "react";

type TrackListingViewProps = {
  listingId: string;
  enabled: boolean;
};

export function TrackListingView({ listingId, enabled }: TrackListingViewProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetch(`/api/views/${listingId}`, {
      method: "POST"
    });
  }, [enabled, listingId]);

  return null;
}
