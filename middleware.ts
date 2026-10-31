import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_PAGE_HEADER,
  getInternalAdminPath,
  getPublicAdminPath,
  mapPublicAdminPathToInternal,
  isInternalAdminPath
} from "@/lib/admin-path";
import {
  VISITOR_ID_COOKIE,
  VISITOR_ID_HEADER,
  VISITOR_ID_TTL_SECONDS
} from "@/lib/visitor-id-constants";

/**
 * Admin HTML routes enforce OWNER_EMAIL in server components / API handlers.
 * TODO: optional Edge middleware admin guard once sessions are verifiable without DB (e.g. signed JWT subset).
 */
export function middleware(request: NextRequest) {
  const publicAdminPath = getPublicAdminPath();
  const internalAdminPath = getInternalAdminPath();
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  // Anonymous-first identity: every page view gets a long-lived visitor id,
  // forwarded to Server Components via a request header (same trick as
  // ADMIN_PAGE_HEADER below) since a Set-Cookie written here isn't visible
  // to cookies() within this same request's render.
  const existingVisitorId = request.cookies.get(VISITOR_ID_COOKIE)?.value;
  const visitorId = existingVisitorId ?? crypto.randomUUID();
  requestHeaders.set(VISITOR_ID_HEADER, visitorId);

  function withVisitorCookie(response: NextResponse) {
    if (!existingVisitorId) {
      response.cookies.set({
        name: VISITOR_ID_COOKIE,
        value: visitorId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: VISITOR_ID_TTL_SECONDS
      });
    }
    return response;
  }

  if (publicAdminPath !== internalAdminPath && isInternalAdminPath(pathname)) {
    // A custom ADMIN_PATH is configured -- the literal /admin path is
    // supposed to be invisible, so this redirects to home instead of
    // revealing a login page (or even a distinctive 404) at the guessed URL.
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";

    return withVisitorCookie(NextResponse.redirect(url));
  }

  if (publicAdminPath !== internalAdminPath) {
    const rewrittenPath = mapPublicAdminPathToInternal(pathname);

    if (rewrittenPath) {
      requestHeaders.set(ADMIN_PAGE_HEADER, "1");
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;

      return withVisitorCookie(
        NextResponse.rewrite(url, { request: { headers: requestHeaders } })
      );
    }

    return withVisitorCookie(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // No ADMIN_PATH override configured -- the literal /admin path is the
  // real thing, so tag it the same way for the layout's hide-logic.
  if (isInternalAdminPath(pathname)) {
    requestHeaders.set(ADMIN_PAGE_HEADER, "1");
  }

  return withVisitorCookie(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
