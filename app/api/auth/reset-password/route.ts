import { NextResponse } from "next/server";

import { resetUserPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations/listing";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/reset-password", request.url), { status: 303 });
  }

  const user = await resetUserPassword(parsed.data);

  if (!user) {
    return NextResponse.redirect(
      new URL(`/reset-password?token=${encodeURIComponent(parsed.data.token)}&error=invalid`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL("/login?notice=password-reset", request.url), {
    status: 303
  });
}
