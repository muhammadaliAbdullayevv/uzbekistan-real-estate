import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  createStoredSession,
  deleteStoredSession,
  getStoredUserSession
} from "@/lib/session-store";

// Renamed from "tashkent-user-session" to avoid leaking project identity.
export const USER_SESSION_COOKIE = "__sid";
export const USER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export type UserSession = {
  userId: string;
  email: string;
  name: string | null;
};

export async function createUserSession(session: UserSession) {
  return createStoredSession({
    kind: "USER",
    userId: session.userId,
    ttlSeconds: USER_SESSION_TTL_SECONDS
  });
}

export async function getUserSession() {
  const token = cookies().get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const session = await getStoredUserSession(token);

    if (!session || session.status === "BLOCKED") {
      return null;
    }

    return {
      userId: session.userId,
      email: session.email,
      name: session.name
    } satisfies UserSession;
  } catch {
    return null;
  }
}

export async function deleteUserSession(token?: string | null) {
  await deleteStoredSession(token);
}

export function setUserSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_SESSION_TTL_SECONDS
  });
}

export function clearUserSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export function getSafeUserNextPath(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  if (nextPath.startsWith("/admin")) {
    return "/";
  }

  return nextPath;
}
