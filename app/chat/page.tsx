import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { BackLink } from "@/components/back-link";
import { EmptyState } from "@/components/empty-state";
import { listConversationsForUser } from "@/lib/conversations";
import { formatDate } from "@/lib/format";
import { getLocale, getTranslations } from "@/lib/i18n";
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
    <div className="shell space-y-8">
      <BackLink href="/" label={t.common.backToListings} />

      <section className="panel flex flex-col gap-3 p-6 sm:p-8">
        <span className="pill border-accent/25 bg-accent/5 text-accent">{t.chat.pill}</span>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {t.chat.inboxTitle}
        </h1>
      </section>

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
        <div className="panel divide-y divide-line/70 overflow-hidden">
          {conversations.map((conversation) => {
            const initial = (conversation.otherName?.trim()?.[0] || "?").toUpperCase();
            const unread = conversation.unreadCount > 0;

            return (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-mist/50 sm:px-6"
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 text-sm font-bold text-accent">
                  {conversation.otherAvatarUrl ? (
                    <Image
                      src={conversation.otherAvatarUrl}
                      alt=""
                      fill
                      sizes="48px"
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
                    className={`mt-1 block truncate text-sm ${unread ? "font-medium text-ink" : "text-ink/60"}`}
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
