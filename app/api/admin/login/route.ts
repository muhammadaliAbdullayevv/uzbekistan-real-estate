import { NextResponse } from "next/server";

import { getOwnerLoginPath } from "@/lib/owner";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL(getOwnerLoginPath(), request.url), { status: 303 });
}

export async function POST(request: Request) {
  return NextResponse.redirect(new URL(getOwnerLoginPath(), request.url), { status: 303 });
}
