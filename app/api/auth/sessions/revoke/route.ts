import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deleteStoredSessionById,
  hashToken
} from "@/lib/session-store";
import { redirectUrl } from "@/lib/site";
import {
  USER_SESSION_COOKIE,
  getUserSession
} from "@/lib/user-session";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/sessions/revoke
 *
 * Accepts application/x-www-form-urlencoded (HTML form) or application/json.
 *
 * With sessionId field: revokes that specific session (must belong to the user).
 * Without sessionId:    revokes ALL sessions EXCEPT the current one.
 *
 * Redirects back to /account/sessions after success.
 */
export async function POST(request: Request) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse sessionId from either form data or JSON body.
  const contentType = request.headers.get("content-type") ?? "";
  let sessionId: string | undefined;

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      sessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;
    } else {
      const formData = await request.formData();
      const raw = formData.get("sessionId");
      sessionId = typeof raw === "string" && raw ? raw : undefined;
    }
  } catch {
    // Malformed body — treat as "revoke all others".
  }

  if (sessionId) {
    // Revoke a specific session, scoped to this user for safety.
    await deleteStoredSessionById(sessionId, session.userId);
  } else {
    // Revoke all sessions EXCEPT the current one so the user stays logged in.
    const currentToken = cookies().get(USER_SESSION_COOKIE)?.value;

    if (!currentToken) {
      // No identifiable current session — revoke everything.
      await prisma.$executeRaw`
        DELETE FROM "AuthSession"
        WHERE "userId" = ${session.userId}
          AND "kind" = CAST(${"USER"} AS "AuthSessionKind")
      `;
    } else {
      const currentTokenHash = hashToken(currentToken);
      await prisma.$executeRaw`
        DELETE FROM "AuthSession"
        WHERE
          "userId" = ${session.userId}
          AND "kind" = CAST(${"USER"} AS "AuthSessionKind")
          AND "tokenHash" != ${currentTokenHash}
      `;
    }
  }

  // Redirect back to the sessions page after form submission.
  return NextResponse.redirect(redirectUrl("/account/sessions"));
}
