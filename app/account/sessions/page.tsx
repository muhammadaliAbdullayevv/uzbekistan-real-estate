import { cookies } from "next/headers";
import Link from "next/link";

export { privatePageMetadata as metadata } from "@/lib/site";

import { getLocale, getTranslations } from "@/lib/i18n";
import { hashToken, getActiveUserSessions } from "@/lib/session-store";
import { requireUser } from "@/lib/session-auth";
import { USER_SESSION_COOKIE } from "@/lib/user-session";
import { formatDate } from "@/lib/format";

export default async function SessionsPage() {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await requireUser("/account/sessions");

  const currentToken = cookies().get(USER_SESSION_COOKIE)?.value ?? "";
  const currentTokenHash = currentToken ? hashToken(currentToken) : "";
  const sessions = await getActiveUserSessions(user.id, currentTokenHash);

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="shell space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/account"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink/60 shadow-soft transition hover:border-ink hover:text-ink"
          aria-label="Back to account"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink/45">Security</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Active Sessions</h1>
        </div>
      </div>

      {/* Current session */}
      <section className="panel p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">Current Session</h2>
        </div>

        {sessions.find((s) => s.isCurrent) ? (
          <div className="space-y-1 rounded-2xl border border-accent/25 bg-accent/5 px-5 py-4">
            {(() => {
              const cur = sessions.find((s) => s.isCurrent)!;
              return (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-ink">
                      This device
                      <span className="ml-2 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        Active now
                      </span>
                    </p>
                    <p className="text-xs text-ink/50">
                      Signed in {formatDate(cur.createdAt, locale)} · Expires{" "}
                      {formatDate(cur.expiresAt, locale)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-sm text-ink/60">No current session data found.</p>
        )}
      </section>

      {/* Other sessions */}
      <section className="panel p-6 sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ink/60"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-ink">Other Devices</h2>
          </div>

          {otherSessions.length > 0 && (
            <form action="/api/auth/sessions/revoke" method="post" id="revoke-all-form">
              <button
                type="submit"
                id="revoke-all-btn"
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 hover:border-rose-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Sign out all other devices
              </button>
            </form>
          )}
        </div>

        {otherSessions.length === 0 ? (
          <div className="rounded-2xl border border-line bg-mist/60 px-5 py-6 text-center text-sm text-ink/60">
            No other active sessions. You&apos;re only signed in on this device.
          </div>
        ) : (
          <ul className="space-y-3">
            {otherSessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-mist/30 px-5 py-4 transition hover:bg-mist/60"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-ink">Session</p>
                  <p className="text-xs text-ink/50">
                    Signed in {formatDate(session.createdAt, locale)} · Expires{" "}
                    {formatDate(session.expiresAt, locale)}
                  </p>
                </div>

                <form action="/api/auth/sessions/revoke" method="post">
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button
                    type="submit"
                    id={`revoke-session-${session.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 hover:border-rose-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Security note */}
      <div className="rounded-[24px] border border-line bg-mist/60 px-6 py-4 text-sm leading-7 text-ink/60">
        <strong className="text-ink">Security tip:</strong> If you see a session you don&apos;t
        recognise, revoke it immediately and change your password.
      </div>
    </div>
  );
}
