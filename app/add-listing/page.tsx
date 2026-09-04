export { privatePageMetadata as metadata } from "@/lib/site";
import { AddListingForm } from "@/components/add-listing-form";
import { BackLink } from "@/components/back-link";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getDistrictOptionsByRegion, getRegionOptions } from "@/lib/locations";
import { getCurrentUser } from "@/lib/session-auth";

type AddListingPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AddListingPage({ searchParams = {} }: AddListingPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await getCurrentUser();
  const showSuccess = searchParams.success === "1";

  return (
    <div className="shell space-y-6">
      <BackLink href="/" label={t.common.backToListings} />

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t.addListing.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">{t.addListing.intro}</p>
        </div>

        <AddListingForm
          regionOptions={getRegionOptions(locale)}
          districtOptionsByRegion={getDistrictOptionsByRegion(locale)}
          listingTypeLabels={t.enums.listingTypes}
          propertyTypeLabels={t.enums.propertyTypes}
          rentTypeLabels={t.enums.rentTypes}
          copy={{
            success: t.addListing.success,
            draftRestored: t.addListing.draftRestored,
            loginToSubmit: t.addListing.loginToSubmit,
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
          isAuthenticated={Boolean(user)}
        />
      </div>
    </div>
  );
}
