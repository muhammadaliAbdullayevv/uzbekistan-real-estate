import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { BackLink } from "@/components/back-link";
import { ChatThread } from "@/components/chat-thread";
import { getConversationDetailForUser, getMessages, markMessagesRead } from "@/lib/conversations";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

type ChatThreadPageProps = {
  params: {
    id: string;
  };
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/chat/${params.id}`)}`);
  }

  const conversation = await getConversationDetailForUser(params.id, session.userId);

  if (!conversation) {
    notFound();
  }

  await markMessagesRead(conversation.id, session.userId);
  const messages = await getMessages(conversation.id);

  return (
    <div className="shell space-y-4">
      <BackLink href="/chat" label={t.chat.backToInbox} />

      <div className="panel flex flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink">
              {conversation.otherName || t.chat.you}
            </p>
            <Link
              href={`/listings/${conversation.listingId}`}
              className="block truncate text-xs text-ink/50 hover:text-accent"
            >
              {conversation.listingTitle}
            </Link>
          </div>
        </div>

        <ChatThread
          conversationId={conversation.id}
          currentUserId={session.userId}
          initialMessages={messages.map((message) => ({
            ...message,
            createdAt: message.createdAt.toISOString(),
            readAt: message.readAt ? message.readAt.toISOString() : null
          }))}
          locale={locale}
          copy={{
            emptyThread: t.chat.emptyThread,
            messagePlaceholder: t.chat.messagePlaceholder,
            send: t.chat.send,
            sending: t.chat.sending
          }}
        />
      </div>
    </div>
  );
}
