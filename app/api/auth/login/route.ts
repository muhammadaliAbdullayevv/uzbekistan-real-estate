import { NextResponse } from "next/server";

import { authenticateUser } from "@/lib/auth";
import {
  clearLoginFailures,
  isLoginRateLimited,
  loginRateLimitKey,
  parseClientIp,
  recordLoginFailure
} from "@/lib/login-rate-limit";
import { resolvePostAuthPath } from "@/lib/owner";
import {
  createUserSession,
  getSafeUserNextPath,
  setUserSessionCookie
} from "@/lib/user-session";
import { userLoginSchema } from "@/lib/validations/listing";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const safeNextPath = getSafeUserNextPath(String(formData.get("next") ?? "/"));
  const encodedNextPath = encodeURIComponent(safeNextPath);

  const parsed = userLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  const emailField = formData.get("email");
  const rawEmailAttempt = typeof emailField === "string" ? emailField.trim() : "";
  const encodedEmailAttempt = rawEmailAttempt
    ? `&email=${encodeURIComponent(rawEmailAttempt)}`
    : "";

  if (!parsed.success) {
    return NextResponse.redirect(
      new URL(`/login?error=invalid&next=${encodedNextPath}${encodedEmailAttempt}`, request.url),
      { status: 303 }
    );
  }

  const ip = parseClientIp(request);
  const rateKey = loginRateLimitKey(ip, parsed.data.email);

  if (await isLoginRateLimited(rateKey)) {
    return NextResponse.redirect(
      new URL(
        `/login?error=rate-limited&next=${encodedNextPath}&email=${encodeURIComponent(parsed.data.email)}`,
        request.url
      ),
      { status: 303 }
    );
  }

  const result = await authenticateUser(parsed.data);

  if (!result.user) {
    if (result.error !== "blocked") {
      await recordLoginFailure(rateKey);
    }

    const emailQuery = `&email=${encodeURIComponent(parsed.data.email)}`;

    return NextResponse.redirect(
      new URL(`/login?error=${result.error}&next=${encodedNextPath}${emailQuery}`, request.url),
      { status: 303 }
    );
  }

  await clearLoginFailures(rateKey);

  const token = await createUserSession(result.user);
  const nextPath = resolvePostAuthPath(result.user, safeNextPath);
  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });

  setUserSessionCookie(response, token);

  return response;
}
