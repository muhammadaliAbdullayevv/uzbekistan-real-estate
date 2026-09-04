import { notFound } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { AiUychiThread } from "@/components/ai-uychi-thread";
import { BackLink } from "@/components/back-link";
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
    <div className="shell space-y-4">
      <BackLink href="/" label={t.common.backToListings} />

      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t.aiUychi.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">{t.aiUychi.intro}</p>
        </div>

        <AiUychiThread
          locale={locale}
          copy={{
            placeholder: t.aiUychi.placeholder,
            send: t.aiUychi.send,
            sending: t.aiUychi.sending,
            emptyState: t.aiUychi.emptyState,
            disclaimer: t.aiUychi.disclaimer,
            viewListing: t.common.viewDetails,
            genericError: t.aiUychi.unableToRespond
          }}
        />
      </div>
    </div>
  );
}
