import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { EmptyState } from "@/components/empty-state";
import { listConversationsForUser } from "@/lib/conversations";
import { formatDate } from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
import { isLocalImageUrl } from "@/lib/image-url";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function ChatInboxPage() {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();

  if (!session) {
    redirect("/login?next=/chat");
  }

  const conversations = await listConversationsForUser(session.userId);

  return (
    <div className="shell">
      <div className="flex items-center gap-3 pb-2">
        <Link
          href="/"
          aria-label={t.common.backToListings}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 transition hover:bg-mist hover:text-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-lg font-semibold text-ink">{t.chat.inboxTitle}</h1>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          eyebrow={t.common.noResults}
          title={t.chat.inboxEmptyTitle}
          description={t.chat.inboxEmptyDescription}
          action={
            <Link href="/" className="btn-primary">
              {t.chat.browseListings}
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-line/70 border-t border-line/70">
          {conversations.map((conversation) => {
            const initial = (conversation.otherName?.trim()?.[0] || "?").toUpperCase();
            const unread = conversation.unreadCount > 0;

            return (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="flex items-center gap-3 py-3 transition hover:bg-mist/50"
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 text-sm font-bold text-accent">
                  {conversation.otherAvatarUrl ? (
                    <Image
                      src={conversation.otherAvatarUrl}
                      alt=""
                      fill
                      unoptimized={isLocalImageUrl(conversation.otherAvatarUrl)}
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    initial
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-sm ${unread ? "font-semibold text-ink" : "font-medium text-ink/80"}`}
                    >
                      {conversation.otherName || t.chat.you}
                    </span>
                    {conversation.lastMessageAt ? (
                      <span className="shrink-0 text-xs text-ink/45">
                        {formatDate(conversation.lastMessageAt, locale)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink/50">
                    {conversation.listingTitle}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-sm ${unread ? "font-medium text-ink" : "text-ink/60"}`}
                  >
                    {conversation.lastMessageBody || t.chat.emptyThread}
                  </span>
                </span>

                {unread ? (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
