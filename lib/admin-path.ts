const INTERNAL_ADMIN_PATH = "/admin";

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
