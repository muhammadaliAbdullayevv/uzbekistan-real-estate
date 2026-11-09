import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { clearAllFavorites, getVisitorId } from "@/lib/favorites";
import { getUserSession } from "@/lib/user-session";

export async function DELETE() {
  const session = await getUserSession();
  const visitorId = getVisitorId();

  await clearAllFavorites({
    visitorId,
    userId: session?.userId ?? null
  });

  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/account");

  return NextResponse.json({ cleared: true });
}
