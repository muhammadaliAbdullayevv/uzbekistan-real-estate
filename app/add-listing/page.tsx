export { privatePageMetadata as metadata } from "@/lib/site";
import { AddListingForm } from "@/components/add-listing-form";
import { SmartBackLink } from "@/components/smart-back-link";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getDistrictOptionsByRegion, getRegionOptions } from "@/lib/locations";
import { getCurrentUser } from "@/lib/session-auth";
import { getTelegramBotUsername } from "@/lib/telegram-verification";

type AddListingPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AddListingPage({ searchParams = {} }: AddListingPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await getCurrentUser();
  const showSuccess = searchParams.success === "1";
  const botUsername = getTelegramBotUsername();

  return (
    <div className="shell space-y-6">
      <SmartBackLink label={t.common.backToListings} fallbackHref="/" />

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {t.addListing.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{t.addListing.intro}</p>
        </div>

        {/* Fast-Track Telegram Bot Submission Banner */}
        {botUsername ? (
          <div className="rounded-[26px] border border-cyan-500/30 bg-gradient-to-r from-[#0F1B29] via-[#122032] to-[#0B2228] p-4 shadow-xl sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="flex items-center gap-2 text-xs font-extrabold text-cyan-300 sm:text-sm">
                  <span aria-hidden="true">⚡</span>
                  <span>
                    {locale === "ru"
                      ? "Спешите? Разместите через Telegram-бот за 30 секунд"
                      : "Shoshilayapsizmi? Telegram botda 30 soniyada joylang"}
                  </span>
                </p>
                <p className="text-xs text-slate-300">
                  {locale === "ru"
                    ? "Просто отправьте фото и описание боту — Gemini AI сам заполнит объявление."
                    : "Forma to'ldirish shart emas — botga rasmlar va qisqa xabar yuboring, Gemini AI e'lonni o'zi tayyorlaydi!"}
                </p>
              </div>
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition hover:from-cyan-300 hover:to-teal-300"
              >
                <span aria-hidden="true">🤖</span>
                <span>@{botUsername} &rarr;</span>
              </a>
            </div>
          </div>
        ) : null}

        <AddListingForm
          regionOptions={getRegionOptions(locale)}
          districtOptionsByRegion={getDistrictOptionsByRegion(locale)}
          listingTypeLabels={t.enums.listingTypes}
          propertyTypeLabels={t.enums.propertyTypes}
          rentTypeLabels={t.enums.rentTypes}
          furnishingLabels={t.enums.furnishingStatuses}
          copy={{
            success: t.addListing.success,
            draftRestored: t.addListing.draftRestored,
            sectionBasic: t.addListing.form.sectionBasic,
            sectionPrice: t.addListing.form.sectionPrice,
            sectionLocation: t.addListing.form.sectionLocation,
            sectionDetails: t.addListing.form.sectionDetails,
            sectionContact: t.addListing.form.sectionContact,
            sectionPhotos: t.addListing.form.sectionPhotos,
            listingType: t.addListing.form.listingType,
            title: t.addListing.form.title,
            titlePlaceholder: t.addListing.form.titlePlaceholder,
            description: t.addListing.form.description,
            descriptionPlaceholder: t.addListing.form.descriptionPlaceholder,
            rentPrice: t.addListing.form.rentPrice,
            salePrice: t.addListing.form.salePrice,
            currency: t.addListing.form.currency,
            region: t.addListing.form.region,
            districtCity: t.addListing.form.districtCity,
            districtSelectPrompt: t.addListing.form.districtSelectPrompt,
            cityNeighborhood: t.addListing.form.cityNeighborhood,
            cityNeighborhoodPlaceholder: t.addListing.form.cityNeighborhoodPlaceholder,
            address: t.addListing.form.address,
            addressPlaceholder: t.addListing.form.addressPlaceholder,
            mapLocation: t.addListing.form.mapLocation,
            mapLocationHelper: t.addListing.form.mapLocationHelper,
            useMyLocation: t.addListing.form.useMyLocation,
            locating: t.addListing.form.locating,
            locateError: t.addListing.form.locateError,
            mapLocationNotSet: t.addListing.form.mapLocationNotSet,
            locationRequired: t.addListing.form.locationRequired,
            rooms: t.addListing.form.rooms,
            area: t.addListing.form.area,
            propertyType: t.addListing.form.propertyType,
            rentType: t.addListing.form.rentType,
            furnishing: t.addListing.form.furnishing,
            furnishingNotSpecified: t.addListing.form.furnishingNotSpecified,
            phone: t.addListing.form.phone,
            images: t.addListing.form.images,
            uploadNote: t.addListing.form.uploadNote,
            uploadCta: t.addListing.form.uploadCta,
            optionalSuffix: t.addListing.form.optionalSuffix,
            draftSaved: t.addListing.form.draftSaved,
            submit: t.addListing.form.submit,
            submitting: t.addListing.form.submitting,
            uploading: t.addListing.form.uploading,
            uploadPreviewAlt: t.addListing.form.uploadPreviewAlt,
            uploadUnable: t.addListing.form.uploadUnable,
            submitUnable: t.addListing.form.submitUnable,
            removeImage: t.common.removeImage,
            imagesRequired: t.addListing.form.imagesRequired,
            perMonth: t.common.perMonth,
            perDay: t.common.perDay
          }}
          showSuccess={showSuccess}
          initialPhone={user?.phone}
        />
      </div>
    </div>
  );
}
