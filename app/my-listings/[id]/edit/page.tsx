import { notFound, redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { AddListingForm } from "@/components/add-listing-form";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getDistrictOptionsByRegion, getRegionOptions, isUzbekistanRegion } from "@/lib/locations";
import { getListingForUserById } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

type EditListingPageProps = {
  params: {
    id: string;
  };
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/my-listings/${params.id}/edit`)}`);
  }

  const listing = await getListingForUserById(session.userId, params.id);

  if (!listing) {
    notFound();
  }

  const region = isUzbekistanRegion(listing.region) ? listing.region : "Tashkent Region";

  return (
    <div className="shell">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t.addListing.editTitle}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">{t.addListing.editIntro}</p>
        </div>

        <AddListingForm
          mode="edit"
          submitPath={`/api/listings/${listing.id}`}
          successPath="/my-listings?status=updated"
          regionOptions={getRegionOptions(locale)}
          districtOptionsByRegion={getDistrictOptionsByRegion(locale)}
          listingTypeLabels={t.enums.listingTypes}
          propertyTypeLabels={t.enums.propertyTypes}
          rentTypeLabels={t.enums.rentTypes}
          copy={{
            success: t.addListing.success,
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
            perDay: t.common.perDay,
            updateSubmit: t.addListing.form.updateSubmit,
            updating: t.addListing.form.updating
          }}
          initialValues={{
            listingType: listing.listingType,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency,
            region,
            district: listing.district,
            city: listing.city,
            address: listing.address,
            rooms: listing.rooms,
            area: listing.area,
            propertyType: listing.propertyType,
            rentType: listing.rentType,
            latitude: listing.latitude ?? 41.311158,
            longitude: listing.longitude ?? 69.279737,
            phone: listing.phone,
            images: listing.images.map((image) => image.url)
          }}
        />
      </div>
    </div>
  );
}
