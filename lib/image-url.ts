import { PLACEHOLDER_IMAGE } from "@/lib/constants";

/**
 * Next.js's built-in image optimizer fetches local paths via an internal
 * loopback request straight to the Node process (bypassing nginx), which
 * doesn't reliably see files written to public/ after the process started
 * -- a freshly uploaded photo can 400 there ("isn't a valid image") even
 * though the raw URL serves fine. Skip the optimizer for anything local so
 * the browser fetches the raw, always-fresh URL instead.
 */
export function isLocalImageUrl(url?: string | null) {
  if (!url) {
    return false;
  }

  return url.startsWith("/") || url.startsWith("blob:") || url.endsWith(".svg");
}

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
