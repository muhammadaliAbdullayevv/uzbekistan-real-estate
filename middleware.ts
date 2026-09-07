import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_PAGE_HEADER,
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
  const requestHeaders = new Headers(request.headers);

  if (publicAdminPath !== internalAdminPath && isInternalAdminPath(pathname)) {
    // A custom ADMIN_PATH is configured -- the literal /admin path is
    // supposed to be invisible, so this redirects to home instead of
    // revealing a login page (or even a distinctive 404) at the guessed URL.
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";

    return NextResponse.redirect(url);
  }

  if (publicAdminPath !== internalAdminPath) {
    const rewrittenPath = mapPublicAdminPathToInternal(pathname);

    if (rewrittenPath) {
      requestHeaders.set(ADMIN_PAGE_HEADER, "1");
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;

      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // No ADMIN_PATH override configured -- the literal /admin path is the
  // real thing, so tag it the same way for the layout's hide-logic.
  if (isInternalAdminPath(pathname)) {
    requestHeaders.set(ADMIN_PAGE_HEADER, "1");
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
