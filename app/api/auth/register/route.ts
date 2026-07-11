import { NextResponse } from "next/server";

import {
  isRegisterRateLimited,
  parseClientIp,
  recordRegisterAttempt,
  registerRateLimitKey
} from "@/lib/login-rate-limit";
import { registerUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { resolvePostAuthPath } from "@/lib/owner";
import { redirectUrl } from "@/lib/site";
import {
  createUserSession,
  getSafeUserNextPath,
  setUserSessionCookie
} from "@/lib/user-session";
import { userRegisterSchema } from "@/lib/validations/listing";

export async function GET() {
  return NextResponse.redirect(redirectUrl("/register"), { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const safeNextPath = getSafeUserNextPath(String(formData.get("next") ?? "/"));
  const encodedNextPath = encodeURIComponent(safeNextPath);
  const ip = parseClientIp(request);
  const rateKey = registerRateLimitKey(ip);

  const parsed = userRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptedTerms: formData.get("acceptedTerms")
  });

  if (!parsed.success) {
    const mismatch = parsed.error.flatten().fieldErrors.confirmPassword?.length;
    const terms = parsed.error.flatten().fieldErrors.acceptedTerms?.length;
    const code = mismatch ? "password-mismatch" : terms ? "terms" : "invalid";
    const nameField = formData.get("name");
    const emailFieldErr = formData.get("email");
    const phoneFieldErr = formData.get("phone");
    const rawName = typeof nameField === "string" ? nameField.trim() : "";
    const rawEmail = typeof emailFieldErr === "string" ? emailFieldErr.trim() : "";
    const rawPhone = typeof phoneFieldErr === "string" ? phoneFieldErr.trim() : "";
    const filled = `&email=${encodeURIComponent(rawEmail)}&name=${encodeURIComponent(rawName)}&phone=${encodeURIComponent(rawPhone)}`;
    return NextResponse.redirect(
      redirectUrl(`/register?error=${code}&next=${encodedNextPath}${filled}`),
      { status: 303 }
    );
  }

  if (await isRegisterRateLimited(rateKey)) {
    const filled = `&email=${encodeURIComponent(parsed.data.email)}&name=${encodeURIComponent(parsed.data.name)}&phone=${encodeURIComponent(parsed.data.phone ?? "")}`;
    return NextResponse.redirect(
      redirectUrl(`/register?error=rate-limited&next=${encodedNextPath}${filled}`),
      { status: 303 }
    );
  }

  await recordRegisterAttempt(rateKey);

  try {
    const sessionPayload = await registerUser({ ...parsed.data, locale: getLocale() });
    const token = await createUserSession(sessionPayload);
    const destination = resolvePostAuthPath(sessionPayload, safeNextPath);
    const response = NextResponse.redirect(redirectUrl(destination), {
      status: 303
    });
    setUserSessionCookie(response, token);
    return response;
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("already exists")
        ? "exists"
        : error instanceof Error && error.message.includes("at least 8")
          ? "password-short"
          : "invalid";

    const filled = `&email=${encodeURIComponent(parsed.data.email)}&name=${encodeURIComponent(parsed.data.name)}&phone=${encodeURIComponent(parsed.data.phone ?? "")}`;

    return NextResponse.redirect(
      redirectUrl(`/register?error=${message}&next=${encodedNextPath}${filled}`),
      { status: 303 }
    );
  }
}
