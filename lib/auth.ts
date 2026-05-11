import { sendPasswordResetEmail } from "@/lib/email";
import type { Locale } from "@/lib/i18n";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createUserProfile,
  getUserByEmail,
  updateUserPassword
} from "@/lib/user-data";
import { createUserToken, consumeUserToken } from "@/lib/user-tokens";
import type { UserSession } from "@/lib/user-session";

export type AuthenticateUserResult =
  | {
      user: UserSession;
      error: null;
    }
  | {
      user: null;
      error: "invalid" | "blocked";
    };

export async function registerUser(input: {
  name?: string;
  email: string;
  password: string;
  phone?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUserProfile({
    name: input.name?.trim() || "",
    email,
    passwordHash,
    phone: input.phone?.trim() || null
  });

  return toUserSession({
    id: user.id,
    email: user.email,
    name: user.name
  });
}

export async function authenticateUser(
  input: { email: string; password: string }
): Promise<AuthenticateUserResult> {
  const user = await getUserByEmail(input.email.trim().toLowerCase());

  if (!user?.passwordHash) {
    return {
      user: null,
      error: "invalid"
    };
  }

  if (user.status === "BLOCKED") {
    return {
      user: null,
      error: "blocked"
    };
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    return {
      user: null,
      error: "invalid"
    };
  }

  return {
    user: toUserSession(user),
    error: null
  };
}

export async function requestPasswordReset(email: string, locale: Locale) {
  const user = await getUserByEmail(email.trim().toLowerCase());

  if (!user) {
    return;
  }

  const reset = await createUserToken({
    userId: user.id,
    type: "RESET_PASSWORD",
    ttlMinutes: 60
  });

  await sendPasswordResetEmail(user.email, reset.token, locale);
}

export async function resetUserPassword(input: { token: string; password: string }) {
  const userId = await consumeUserToken(input.token, "RESET_PASSWORD");

  if (!userId) {
    return null;
  }

  const passwordHash = await hashPassword(input.password);
  return updateUserPassword(userId, passwordHash);
}

export function toUserSession(user: {
  id: string;
  email: string;
  name: string | null;
}): UserSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name
  };
}
