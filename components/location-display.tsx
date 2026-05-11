import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { formatLocationSummary, getLocationDetails } from "@/lib/locations";

type LocationValue = {
  region?: string | null;
  district?: string | null;
  city?: string | null;
  address?: string | null;
};

type LocationSummaryProps = {
  locale: Locale;
  value: LocationValue;
  className?: string;
};

type LocationSectionProps = {
  locale: Locale;
  value: LocationValue;
  className?: string;
};

export function LocationSummary({
  locale,
  value,
  className
}: LocationSummaryProps) {
  return <p className={className}>{formatLocationSummary(value, locale)}</p>;
}

export function LocationSection({
  locale,
  value,
  className
}: LocationSectionProps) {
  const t = getTranslations(locale);
  const details = getLocationDetails(value, locale);

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/45">
        {t.common.location}
      </h2>
      <dl className="mt-4 space-y-3 text-sm text-ink/72">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-ink/48">{t.common.region}</dt>
          <dd className="max-w-[18rem] text-right font-medium text-ink">
            {details.region ?? "—"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-ink/48">{t.common.district}</dt>
          <dd className="max-w-[18rem] text-right font-medium text-ink">
            {details.districtCity ?? "—"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-ink/48">{t.common.address}</dt>
          <dd className="max-w-[18rem] text-right font-medium text-ink">
            {value.address?.trim() || "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
