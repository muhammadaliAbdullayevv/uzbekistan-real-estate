import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getPublicAdminPath } from "@/lib/admin-path";
import { applyUserAdminAction, getUserProfileById } from "@/lib/user-data";
import { getOwnerLoginPath, isOwner } from "@/lib/owner";
import { redirectUrl } from "@/lib/site";
import { getUserSession } from "@/lib/user-session";
import { adminUserActionSchema } from "@/lib/validations/listing";

type RouteContext = {
  params: {
    id: string;
  };
};

function buildRedirectUrl(input: { search?: string; userNotice?: string; userError?: string }) {
  const url = redirectUrl(getPublicAdminPath());

  if (input.search) {
    url.searchParams.set("user", input.search);
  }

  if (input.userNotice) {
    url.searchParams.set("userNotice", input.userNotice);
  }

  if (input.userError) {
    url.searchParams.set("userError", input.userError);
  }

  return url;
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.redirect(redirectUrl(getOwnerLoginPath()), { status: 303 });
  }

  if (!isOwner(session)) {
    return NextResponse.redirect(redirectUrl("/account"), { status: 303 });
  }

  const formData = await request.formData();
  const parsed = adminUserActionSchema.safeParse({
    action: formData.get("action"),
    search: formData.get("search")
  });
  const search = parsed.success ? parsed.data.search : String(formData.get("search") ?? "").trim();

  if (!parsed.success) {
    return NextResponse.redirect(
      buildRedirectUrl({ search, userError: "invalid-action" }),
      { status: 303 }
    );
  }

  const user = await getUserProfileById(params.id);

  if (!user) {
    return NextResponse.redirect(
      buildRedirectUrl({ search, userError: "not-found" }),
      { status: 303 }
    );
  }

  if (isOwner(user)) {
    return NextResponse.redirect(
      buildRedirectUrl({ search, userError: "owner-protected" }),
      { status: 303 }
    );
  }

  await applyUserAdminAction(user.id, parsed.data.action);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/favorites");
  revalidatePath("/my-listings");

  return NextResponse.redirect(
    buildRedirectUrl({ search, userNotice: "updated" }),
    { status: 303 }
  );
}
