"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { LocationSelect } from "@/components/location-select";
import {
  CURRENCIES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_TYPES,
  PLACEHOLDER_IMAGE,
  type CurrencyValue,
  type ListingTypeValue,
  type RentTypeValue
} from "@/lib/constants";
import type { UzbekistanRegion } from "@/lib/locations";

type AddListingFormProps = {
  mode?: "create" | "edit";
  submitPath?: string;
  successPath?: string;
  regionOptions: Array<{
    value: UzbekistanRegion;
    label: string;
  }>;
  listingTypeLabels: Record<(typeof LISTING_TYPES)[number], string>;
  propertyTypeLabels: Record<(typeof PROPERTY_TYPES)[number], string>;
  rentTypeLabels: Record<(typeof RENT_TYPES)[number], string>;
  copy: {
    success: string;
    listingType: string;
    listingTypeRent: string;
    listingTypeSale: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    rentPrice: string;
    salePrice: string;
    currency: string;
    region: string;
    districtCity: string;
    districtCityPlaceholder: string;
    cityNeighborhood: string;
    cityNeighborhoodPlaceholder: string;
    address: string;
    addressPlaceholder: string;
    rooms: string;
    area: string;
    propertyType: string;
    rentType: string;
    phone: string;
    images: string;
    uploadNote: string;
    submit: string;
    submitting: string;
    uploading: string;
    uploadPreviewAlt: string;
    uploadUnable: string;
    submitUnable: string;
    removeImage: string;
    placeholderPreview: string;
    perMonth: string;
    perDay: string;
    updateSubmit?: string;
    updating?: string;
  };
  showSuccess?: boolean;
  initialPhone?: string | null;
  initialValues?: {
    listingType: ListingTypeValue;
    title: string;
    description: string;
    price: number;
    currency: CurrencyValue;
    region: UzbekistanRegion;
    district: string;
    city: string | null;
    address: string;
    rooms: number;
    area: number;
    propertyType: (typeof PROPERTY_TYPES)[number];
    rentType: RentTypeValue | null;
    phone: string;
    images: string[];
  };
};

export function AddListingForm({
  mode = "create",
  submitPath = "/api/listings",
  successPath = "/add-listing?success=1",
  regionOptions,
  listingTypeLabels,
  propertyTypeLabels,
  rentTypeLabels,
  copy,
  showSuccess = false,
  initialPhone,
  initialValues
}: AddListingFormProps) {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingTypeValue>(
    initialValues?.listingType ?? "rent"
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyValue>(
    initialValues?.currency ?? "USD"
  );
  const [selectedRentType, setSelectedRentType] = useState<RentTypeValue>(
    initialValues?.rentType ?? "monthly"
  );
  const [imageUrls, setImageUrls] = useState<string[]>(initialValues?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadSingleFile(file: File) {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? copy.uploadUnable);
    }

    return payload.url as string;
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 10 - imageUrls.length);

    if (files.length === 0) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const uploaded = await Promise.all(files.map((file) => uploadSingleFile(file)));
      setImageUrls((current) => [...current, ...uploaded]);
    } catch (uploadIssue) {
      setUploadError(
        uploadIssue instanceof Error ? uploadIssue.message : copy.uploadUnable
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImageUrls((current) => current.filter((image) => image !== url));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const getValue = (name: string) => String(formData.get(name) ?? "");

    const payload = {
      listingType: getValue("listingType"),
      title: getValue("title"),
      description: getValue("description"),
      price: getValue("price"),
      currency: getValue("currency"),
      region: getValue("region"),
      district: getValue("district"),
      city: getValue("city"),
      address: getValue("address"),
      rooms: getValue("rooms"),
      area: getValue("area"),
      propertyType: getValue("propertyType"),
      rentType: listingType === "rent" ? getValue("rentType") : "",
      phone: getValue("phone"),
      images: imageUrls
    };

    try {
      const response = await fetch(submitPath, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? copy.submitUnable);
      }

      router.push(successPath);
      router.refresh();
    } catch (submitIssue) {
      setError(submitIssue instanceof Error ? submitIssue.message : copy.submitUnable);
    } finally {
      setIsSubmitting(false);
    }
  }

  const priceLabel = listingType === "rent" ? copy.rentPrice : copy.salePrice;
  const priceSuffix =
    listingType === "rent"
      ? `${selectedCurrency}${selectedRentType === "daily" ? copy.perDay : copy.perMonth}`
      : null;

  return (
    <div className="space-y-6">
      {showSuccess ? (
        <div className="panel border-accent/25 bg-accent/5 p-4 text-sm font-medium text-accent">
          {copy.success}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="panel space-y-8 p-6 sm:p-8">
        <section className="space-y-3">
          <label className="block text-sm font-medium text-ink/80">{copy.listingType}</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {LISTING_TYPES.map((option) => {
              const checked = listingType === option;

              return (
                <label
                  key={option}
                  className={`cursor-pointer rounded-[24px] border px-5 py-4 transition ${
                    checked
                      ? "border-accent bg-accent/6 shadow-sm"
                      : "border-line bg-white hover:border-ink/20 hover:bg-mist/40"
                  }`}
                >
              <input
                    type="radio"
                    name="listingType"
                    value={option}
                    checked={checked}
                    onChange={() => setListingType(option)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {option === "rent" ? copy.listingTypeRent : copy.listingTypeSale}
                      </p>
                      <p className="mt-1 text-sm text-ink/60">
                        {listingTypeLabels[option]}
                      </p>
                    </div>
                    <span
                      className={`h-4 w-4 rounded-full border ${
                        checked ? "border-accent bg-accent" : "border-line bg-white"
                      }`}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.title}
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={5}
              maxLength={140}
              className="input"
              defaultValue={initialValues?.title ?? ""}
              placeholder={copy.titlePlaceholder}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.description}
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              className="textarea"
              defaultValue={initialValues?.description ?? ""}
              placeholder={copy.descriptionPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium text-ink/80">
              {priceLabel}
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              required
              className="input"
              defaultValue={initialValues?.price ?? ""}
              placeholder="450"
            />
            {priceSuffix ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
                {priceSuffix}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="currency" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.currency}
            </label>
            <select
              id="currency"
              name="currency"
              className="select"
              value={selectedCurrency}
              onChange={(event) => setSelectedCurrency(event.target.value as CurrencyValue)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <LocationSelect
              id="region"
              name="region"
              label={copy.region}
              defaultValue={initialValues?.region ?? regionOptions[0]?.value}
              options={regionOptions}
            />
          </div>

          <div>
            <label htmlFor="district" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.districtCity}
            </label>
            <input
              id="district"
              name="district"
              required
              className="input"
              defaultValue={initialValues?.district ?? ""}
              placeholder={copy.districtCityPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.cityNeighborhood}
            </label>
            <input
              id="city"
              name="city"
              className="input"
              defaultValue={initialValues?.city ?? ""}
              placeholder={copy.cityNeighborhoodPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.address}
            </label>
            <input
              id="address"
              name="address"
              required
              className="input"
              defaultValue={initialValues?.address ?? ""}
              placeholder={copy.addressPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="rooms" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.rooms}
            </label>
            <input
              id="rooms"
              name="rooms"
              type="number"
              min="1"
              required
              className="input"
              defaultValue={initialValues?.rooms ?? ""}
              placeholder="2"
            />
          </div>

          <div>
            <label htmlFor="area" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.area}
            </label>
            <input
              id="area"
              name="area"
              type="number"
              min="10"
              required
              className="input"
              defaultValue={initialValues?.area ?? ""}
              placeholder="65"
            />
          </div>

          <div>
            <label htmlFor="propertyType" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.propertyType}
            </label>
            <select
              id="propertyType"
              name="propertyType"
              className="select"
              defaultValue={initialValues?.propertyType ?? PROPERTY_TYPES[0]}
            >
              {PROPERTY_TYPES.map((propertyType) => (
                <option key={propertyType} value={propertyType}>
                  {propertyTypeLabels[propertyType]}
                </option>
              ))}
            </select>
          </div>

          {listingType === "rent" ? (
            <div>
              <label htmlFor="rentType" className="mb-2 block text-sm font-medium text-ink/80">
                {copy.rentType}
              </label>
              <select
              id="rentType"
              name="rentType"
              className="select"
              value={selectedRentType}
                onChange={(event) => setSelectedRentType(event.target.value as RentTypeValue)}
              >
                {RENT_TYPES.map((rentType) => (
                  <option key={rentType} value={rentType}>
                    {rentTypeLabels[rentType]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.phone}
            </label>
            <input
              id="phone"
              name="phone"
              required
              defaultValue={initialValues?.phone ?? initialPhone ?? ""}
              className="input"
              placeholder="+998901234567"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="images" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.images}
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full rounded-2xl border border-dashed border-line bg-white px-4 py-4 text-sm text-ink/70"
            />
            <p className="mt-2 text-sm text-ink/60">
              {copy.uploadNote}
            </p>
          </div>
        </div>

        {uploadError ? (
          <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {uploadError}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE]).map((url, index) => (
            <div key={`${url}-${index}`} className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border bg-white">
                <Image
                  src={url}
                  alt={`${copy.uploadPreviewAlt} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 20vw"
                />
              </div>

              {imageUrls.includes(url) ? (
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="btn-secondary w-full py-2.5"
                >
                  {copy.removeImage}
                </button>
              ) : (
                <div className="text-center text-xs uppercase tracking-[0.2em] text-ink/45">
                  {copy.placeholderPreview}
                </div>
              )}
            </div>
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === "edit"
              ? copy.updating ?? copy.submitting
              : copy.submitting
            : isUploading
              ? copy.uploading
              : mode === "edit"
                ? copy.updateSubmit ?? copy.submit
                : copy.submit}
        </button>
      </form>
    </div>
  );
}
