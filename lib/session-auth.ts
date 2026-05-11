import { redirect } from "next/navigation";

import { getOwnerLoginPath, isOwner as sessionIsOwner } from "@/lib/owner";
import type { UserProfile } from "@/lib/user-data";
import { getUserProfileById } from "@/lib/user-data";
import { getUserSession } from "@/lib/user-session";

export type CurrentUser = UserProfile;

/** Current session user without password fields (never loaded from DB). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getUserSession();
  if (!session) {
    return null;
  }
  return getUserProfileById(session.userId);
}

export async function requireUser(nextPath = "/account"): Promise<CurrentUser> {
  const session = await getUserSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  const user = await getUserProfileById(session.userId);
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

/** Owner dashboard: must match OWNER_EMAIL server-side. */
export async function requireOwnerSession(): Promise<CurrentUser> {
  const session = await getUserSession();
  if (!session) {
    redirect(getOwnerLoginPath());
  }
  if (!sessionIsOwner(session)) {
    redirect("/account");
  }
  const user = await getUserProfileById(session.userId);
  if (!user) {
    redirect(getOwnerLoginPath());
  }
  return user;
}

export { isOwner } from "@/lib/owner";
