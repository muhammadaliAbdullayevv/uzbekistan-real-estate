/**
 * Split out from lib/i18n.ts so it can be imported by Client Components --
 * lib/i18n.ts pulls in next/headers at module scope (for getLocale), which
 * breaks the build if a client bundle imports anything from that file.
 */
export function formatMessage(template: string, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template
  );
}
