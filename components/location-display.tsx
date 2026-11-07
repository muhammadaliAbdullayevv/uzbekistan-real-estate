import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { formatLocationSummary, getLocationDetails } from "@/lib/locations";

type LocationValue = {
  region?: string | null;
  district?: string | null;
  city?: string | null;
  street?: string | null;
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
      <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
        {t.common.location}
      </h2>
      <dl className="mt-3 space-y-2.5 text-sm text-slate-600">
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-slate-500">{t.common.region}</dt>
          <dd className="max-w-[18rem] text-right font-bold text-slate-900">
            {details.region ?? "—"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-slate-500">{t.common.district}</dt>
          <dd className="max-w-[18rem] text-right font-bold text-slate-900">
            {details.districtCity ?? "—"}
          </dd>
        </div>
        {value.street?.trim() ? (
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">
              {locale === "ru" ? "Улица / квартал" : "Ko'cha / mahalla"}
            </dt>
            <dd className="max-w-[18rem] text-right font-bold text-slate-900">
              {value.street.trim()}
            </dd>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-slate-500">{t.common.address}</dt>
          <dd className="max-w-[18rem] text-right font-bold text-slate-900">
            {value.address?.trim() || "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
