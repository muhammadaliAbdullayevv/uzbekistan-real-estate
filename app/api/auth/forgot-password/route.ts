import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/lib/auth";
import { getLocaleFromValue } from "@/lib/i18n";
import {
  forgotPasswordRateLimitKey,
  isForgotPasswordRateLimited,
  parseClientIp,
  recordForgotPasswordAttempt
} from "@/lib/login-rate-limit";
import { forgotPasswordSchema } from "@/lib/validations/listing";

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = getLocaleFromValue(
    typeof formData.get("locale") === "string" ? (formData.get("locale") as string) : null
  );
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (parsed.success) {
    const ip = parseClientIp(request);
    const rateKey = forgotPasswordRateLimitKey(ip, parsed.data.email);

    if (await isForgotPasswordRateLimited(rateKey)) {
      return NextResponse.redirect(new URL("/forgot-password?error=rate-limited", request.url), {
        status: 303
      });
    }

    await recordForgotPasswordAttempt(rateKey);

    try {
      await requestPasswordReset(parsed.data.email, locale);
    } catch (error) {
      console.error("Password reset email delivery failed:", error);
      return NextResponse.redirect(new URL("/forgot-password?error=delivery", request.url), {
        status: 303
      });
    }
  }

  return NextResponse.redirect(new URL("/forgot-password?sent=1", request.url), {
    status: 303
  });
}
