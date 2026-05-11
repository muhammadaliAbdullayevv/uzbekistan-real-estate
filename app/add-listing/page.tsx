

export { privatePageMetadata as metadata } from "@/lib/site";
import { AddListingForm } from "@/components/add-listing-form";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getRegionOptions } from "@/lib/locations";
import { requireUser } from "@/lib/session-auth";

type AddListingPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AddListingPage({ searchParams = {} }: AddListingPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const user = await requireUser("/add-listing");
  const showSuccess = searchParams.success === "1";

  return (
    <div className="shell grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
      <section className="panel h-fit space-y-5 p-6 sm:p-8">
        <span className="pill border-accent/25 bg-accent/5 text-accent">
          {t.addListing.pill}
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
          {t.addListing.title}
        </h1>
        <p className="text-base leading-7 text-ink/70">{t.addListing.intro}</p>
        <div className="rounded-[24px] bg-mist p-5 text-sm leading-7 text-ink/70">
          {t.addListing.tips}
        </div>
        <div className="rounded-[24px] border border-accent/20 bg-accent/5 p-5 text-sm leading-7 text-ink/70">
          {t.addListing.locationOnly}
        </div>
      </section>

      <AddListingForm
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
          perDay: t.common.perDay
        }}
        showSuccess={showSuccess}
        initialPhone={user?.phone}
      />
    </div>
  );
}
