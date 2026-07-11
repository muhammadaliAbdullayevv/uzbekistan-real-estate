import { NextResponse } from "next/server";

import { resetUserPassword } from "@/lib/auth";
import { redirectUrl } from "@/lib/site";
import { resetPasswordSchema } from "@/lib/validations/listing";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return NextResponse.redirect(redirectUrl("/reset-password"), { status: 303 });
  }

  const user = await resetUserPassword(parsed.data);

  if (!user) {
    return NextResponse.redirect(
      redirectUrl(`/reset-password?token=${encodeURIComponent(parsed.data.token)}&error=invalid`),
      { status: 303 }
    );
  }

  return NextResponse.redirect(redirectUrl("/login?notice=password-reset"), {
    status: 303
  });
}
