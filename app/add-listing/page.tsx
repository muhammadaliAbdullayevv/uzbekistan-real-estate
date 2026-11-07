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
    <div className="shell -mt-4 space-y-3 sm:mt-0 sm:space-y-5">
      <div className="mx-auto max-w-5xl space-y-3 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <SmartBackLink label={locale === "ru" ? "Назад" : "Orqaga"} fallbackHref="/" />
            <h1 className="font-display text-lg font-extrabold text-slate-900 sm:text-2xl">
              {locale === "ru" ? "Новое объявление" : "Yangi e'lon joylash"}
            </h1>
          </div>

          {/* Fast-Track Telegram Bot Submission Pill */}
          {botUsername ? (
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-blue-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50 sm:text-xs"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              <span>@{botUsername}</span>
            </a>
          ) : null}
        </div>

        <AddListingForm
          locale={locale}
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
          initialName={user?.name}
          initialEmail={user?.email}
        />
      </div>
    </div>
  );
}
