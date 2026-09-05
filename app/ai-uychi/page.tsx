import { notFound } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { AiUychiThread } from "@/components/ai-uychi-thread";
import { hasGeminiConfig } from "@/lib/gemini";
import { getLocale, getTranslations } from "@/lib/i18n";
import { requireUser } from "@/lib/session-auth";

export const dynamic = "force-dynamic";

export default async function AiUychiPage() {
  if (!hasGeminiConfig()) {
    notFound();
  }

  const locale = getLocale();
  const t = getTranslations(locale);
  await requireUser("/ai-uychi");

  return (
    <AiUychiThread
      locale={locale}
      copy={{
        title: t.aiUychi.title,
        subtitle: t.aiUychi.subtitle,
        backLabel: t.common.backToListings,
        placeholder: t.aiUychi.placeholder,
        send: t.aiUychi.send,
        sending: t.aiUychi.sending,
        emptyState: t.aiUychi.emptyState,
        viewListing: t.common.viewDetails,
        genericError: t.aiUychi.unableToRespond
      }}
    />
  );
}
