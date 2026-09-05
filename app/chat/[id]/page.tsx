import { notFound, redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
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
    <ChatThread
      conversationId={conversation.id}
      currentUserId={session.userId}
      otherName={conversation.otherName || t.chat.you}
      otherAvatarUrl={conversation.otherAvatarUrl}
      listingId={conversation.listingId}
      listingTitle={conversation.listingTitle}
      initialMessages={messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        readAt: message.readAt ? message.readAt.toISOString() : null
      }))}
      locale={locale}
      copy={{
        backLabel: t.chat.backToInbox,
        emptyThread: t.chat.emptyThread,
        messagePlaceholder: t.chat.messagePlaceholder,
        send: t.chat.send,
        sending: t.chat.sending
      }}
    />
  );
}
