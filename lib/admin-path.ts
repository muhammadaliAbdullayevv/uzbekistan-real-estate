const INTERNAL_ADMIN_PATH = "/admin";

/**
 * Set by middleware on requests that resolve to the admin page (whether via
 * the literal /admin path with no ADMIN_PATH override, or a rewritten
 * custom path), read by the root layout via next/headers. Carries only a
 * boolean signal, never the actual public admin path string -- that value
 * must never reach a client bundle shipped on every page (mobile tab bar /
 * footer visibility are rendered globally), or the custom path stops being
 * hidden from anyone who views source on the homepage.
 */
export const ADMIN_PAGE_HEADER = "x-is-admin-page";

function normalizeAdminPath(value?: string | null) {
  const raw = value?.trim();

  if (!raw) {
    return INTERNAL_ADMIN_PATH;
  }

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");

  if (collapsed === "/") {
    return INTERNAL_ADMIN_PATH;
  }

  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
}

export function getInternalAdminPath() {
  return INTERNAL_ADMIN_PATH;
}

export function getPublicAdminPath() {
  return normalizeAdminPath(process.env.ADMIN_PATH);
}

export function getPublicAdminLoginPath() {
  return `${getPublicAdminPath()}/login`;
}

export function mapPublicAdminPathToInternal(pathname: string) {
  const publicAdminPath = getPublicAdminPath();

  if (pathname === publicAdminPath) {
    return INTERNAL_ADMIN_PATH;
  }

  if (pathname.startsWith(`${publicAdminPath}/`)) {
    return pathname.replace(publicAdminPath, INTERNAL_ADMIN_PATH);
  }

  return null;
}

export function isInternalAdminPath(pathname: string) {
  return pathname === INTERNAL_ADMIN_PATH || pathname.startsWith(`${INTERNAL_ADMIN_PATH}/`);
}
