import type { Metadata } from "next";

export const siteConfig = {
  name: "Uzbekistan Rentals",
  shortName: "Uzbekistan Rentals",
  location: "Uzbekistan",
  description:
    "Browse approved flats, houses, and rooms across Uzbekistan for rent or sale with clear prices and direct owner contact.",
  contactEmail: process.env.PUBLIC_CONTACT_EMAIL || "hello@example.com"
} as const;

export function getSiteUrl() {
  const raw = process.env.SITE_URL?.trim();

  if (!raw) {
    return "http://localhost:3000";
  }

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

/**
 * Builds a redirect target from SITE_URL rather than the incoming request's
 * Host header — some hosts (e.g. Render) proxy requests with an internal
 * Host like "localhost:10000" instead of the public domain, which would
 * otherwise send redirects to an unreachable address.
 */
export function redirectUrl(path: string) {
  return new URL(getAbsoluteUrl(path));
}

export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};
