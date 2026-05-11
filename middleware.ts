import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getInternalAdminPath,
  getPublicAdminPath,
  mapPublicAdminPathToInternal,
  isInternalAdminPath
} from "@/lib/admin-path";

/**
 * Admin HTML routes enforce OWNER_EMAIL in server components / API handlers.
 * TODO: optional Edge middleware admin guard once sessions are verifiable without DB (e.g. signed JWT subset).
 */
export function middleware(request: NextRequest) {
  const publicAdminPath = getPublicAdminPath();
  const internalAdminPath = getInternalAdminPath();
  const { pathname } = request.nextUrl;

  if (publicAdminPath !== internalAdminPath && isInternalAdminPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";

    return NextResponse.redirect(url);
  }

  if (publicAdminPath !== internalAdminPath) {
    const rewrittenPath = mapPublicAdminPathToInternal(pathname);

    if (rewrittenPath) {
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;

      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
