import { PLACEHOLDER_IMAGE } from "@/lib/constants";

export function getSafeListingImageUrl(url?: string | null) {
  if (!url) {
    return PLACEHOLDER_IMAGE;
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return PLACEHOLDER_IMAGE;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      parsed.pathname.startsWith("/uploads/")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }

    return parsed.toString();
  } catch {
    return PLACEHOLDER_IMAGE;
  }
}
