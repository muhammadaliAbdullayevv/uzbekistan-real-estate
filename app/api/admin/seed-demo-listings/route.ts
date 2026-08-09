import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getPublicAdminPath } from "@/lib/admin-path";
import { prisma } from "@/lib/db";
import { getOwnerLoginPath, isOwner } from "@/lib/owner";
import { seedDemoData } from "@/lib/seed-demo-data";
import { redirectUrl } from "@/lib/site";
import { getUserSession } from "@/lib/user-session";

export async function POST() {
  const session = await getUserSession();
  const ownerDashboardPath = getPublicAdminPath();

  if (!session) {
    return NextResponse.redirect(redirectUrl(getOwnerLoginPath()), { status: 303 });
  }

  if (!isOwner(session)) {
    return NextResponse.redirect(redirectUrl("/account"), { status: 303 });
  }

  try {
    await seedDemoData(prisma);
  } catch (error) {
    console.error("Demo data seed failed:", error);
    return NextResponse.redirect(redirectUrl(`${ownerDashboardPath}?seedError=1`), {
      status: 303
    });
  }

  revalidatePath("/");
  revalidatePath(ownerDashboardPath);

  return NextResponse.redirect(redirectUrl(`${ownerDashboardPath}?seeded=1`), { status: 303 });
}
