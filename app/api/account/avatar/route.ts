import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isValidListingImageValue } from "@/lib/validations/listing";
import { updateUserAvatar } from "@/lib/user-data";
import { getUserSession } from "@/lib/user-session";

export async function POST(request: Request) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";

  if (!avatarUrl || !isValidListingImageValue(avatarUrl)) {
    return NextResponse.json({ error: "Invalid avatar URL." }, { status: 400 });
  }

  await updateUserAvatar(session.userId, avatarUrl);

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
