import { getPublicAdminPath } from "@/lib/admin-path";
import type { UserSession } from "@/lib/user-session";

type SessionWithEmail = Pick<UserSession, "email"> | null | undefined;

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

export function getOwnerEmail() {
  return normalizeEmail(process.env.OWNER_EMAIL);
}

export function isOwner(session: SessionWithEmail) {
  const ownerEmail = getOwnerEmail();
  const sessionEmail = normalizeEmail(session?.email);

  return Boolean(ownerEmail && sessionEmail && ownerEmail === sessionEmail);
}

export function getOwnerDashboardPath() {
  return getPublicAdminPath();
}

export function getOwnerLoginPath() {
  return `/login?next=${encodeURIComponent(getOwnerDashboardPath())}`;
}

export function resolvePostAuthPath(session: SessionWithEmail, nextPath: string) {
  if (nextPath !== "/") {
    return nextPath;
  }

  return isOwner(session) ? getOwnerDashboardPath() : "/account";
}
