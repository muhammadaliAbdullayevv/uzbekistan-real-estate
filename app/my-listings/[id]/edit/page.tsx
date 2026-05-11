import { notFound, redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { AddListingForm } from "@/components/add-listing-form";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getRegionOptions, isUzbekistanRegion } from "@/lib/locations";
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
    <div className="shell grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
      <section className="panel h-fit space-y-5 p-6 sm:p-8">
        <span className="pill border-accent/25 bg-accent/5 text-accent">
          {t.addListing.pill}
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
          {t.addListing.editTitle}
        </h1>
        <p className="text-base leading-7 text-ink/70">{t.addListing.editIntro}</p>
        <div className="rounded-[24px] bg-mist p-5 text-sm leading-7 text-ink/70">
          {t.addListing.tips}
        </div>
      </section>

      <AddListingForm
        mode="edit"
        submitPath={`/api/listings/${listing.id}`}
        successPath="/my-listings?status=updated"
        regionOptions={getRegionOptions(locale)}
        listingTypeLabels={t.enums.listingTypes}
        propertyTypeLabels={t.enums.propertyTypes}
        rentTypeLabels={t.enums.rentTypes}
        copy={{
          success: t.addListing.success,
          listingType: t.addListing.form.listingType,
          listingTypeRent: t.addListing.form.listingTypeRent,
          listingTypeSale: t.addListing.form.listingTypeSale,
          title: t.addListing.form.title,
          titlePlaceholder: t.addListing.form.titlePlaceholder,
          description: t.addListing.form.description,
          descriptionPlaceholder: t.addListing.form.descriptionPlaceholder,
          rentPrice: t.addListing.form.rentPrice,
          salePrice: t.addListing.form.salePrice,
          currency: t.addListing.form.currency,
          region: t.addListing.form.region,
          districtCity: t.addListing.form.districtCity,
          districtCityPlaceholder: t.addListing.form.districtCityPlaceholder,
          cityNeighborhood: t.addListing.form.cityNeighborhood,
          cityNeighborhoodPlaceholder: t.addListing.form.cityNeighborhoodPlaceholder,
          address: t.addListing.form.address,
          addressPlaceholder: t.addListing.form.addressPlaceholder,
          rooms: t.addListing.form.rooms,
          area: t.addListing.form.area,
          propertyType: t.addListing.form.propertyType,
          rentType: t.addListing.form.rentType,
          phone: t.addListing.form.phone,
          images: t.addListing.form.images,
          uploadNote: t.addListing.form.uploadNote,
          submit: t.addListing.form.submit,
          submitting: t.addListing.form.submitting,
          uploading: t.addListing.form.uploading,
          uploadPreviewAlt: t.addListing.form.uploadPreviewAlt,
          uploadUnable: t.addListing.form.uploadUnable,
          submitUnable: t.addListing.form.submitUnable,
          removeImage: t.common.removeImage,
          placeholderPreview: t.common.placeholderPreview,
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
          phone: listing.phone,
          images: listing.images.map((image) => image.url)
        }}
      />
    </div>
  );
}
