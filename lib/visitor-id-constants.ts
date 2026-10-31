// Kept dependency-free (no next/headers, no prisma) so middleware.ts --
// which runs on the Edge runtime -- can import it safely alongside
// lib/favorites.ts.
export const VISITOR_ID_COOKIE = "__vid";
export const VISITOR_ID_HEADER = "x-visitor-id";
export const VISITOR_ID_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
