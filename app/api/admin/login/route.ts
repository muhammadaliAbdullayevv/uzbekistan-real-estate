import { NextResponse } from "next/server";

import { getOwnerLoginPath } from "@/lib/owner";
import { redirectUrl } from "@/lib/site";

export async function GET() {
  return NextResponse.redirect(redirectUrl(getOwnerLoginPath()), { status: 303 });
}

export async function POST() {
  return NextResponse.redirect(redirectUrl(getOwnerLoginPath()), { status: 303 });
}
