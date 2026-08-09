"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

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

const DRAFT_STORAGE_KEY = "draft-listing";

type DraftValues = {
  listingType?: string;
  title?: string;
  description?: string;
  price?: string;
  currency?: string;
  region?: string;
  district?: string;
  city?: string;
  address?: string;
  rooms?: string;
  area?: string;
  propertyType?: string;
  rentType?: string;
  phone?: string;
  images?: string[];
};

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
    draftRestored?: string;
    loginToSubmit?: string;
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
  isAuthenticated?: boolean;
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
  isAuthenticated = true,
  initialValues
}: AddListingFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
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
  const [restoredDraft, setRestoredDraft] = useState<DraftValues | null>(null);

  // Anonymous visitors can fill out the form; a draft persists across the
  // login redirect round trip so nothing typed is lost.
  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    try {
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as DraftValues;
      setRestoredDraft(parsed);

      if (parsed.listingType === "rent" || parsed.listingType === "sale") {
        setListingType(parsed.listingType);
      }
      if (parsed.currency) {
        setSelectedCurrency(parsed.currency as CurrencyValue);
      }
      if (parsed.rentType === "monthly" || parsed.rentType === "daily") {
        setSelectedRentType(parsed.rentType);
      }
      if (parsed.images) {
        setImageUrls(parsed.images);
      }
    } catch {
      // Ignore malformed/unavailable drafts — form just starts empty.
    }
  }, [mode]);

  function persistDraft(overrideImages?: string[]) {
    if (mode !== "create" || !formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);
    const draft: DraftValues = {
      listingType: String(formData.get("listingType") ?? listingType),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: String(formData.get("price") ?? ""),
      currency: String(formData.get("currency") ?? selectedCurrency),
      region: String(formData.get("region") ?? ""),
      district: String(formData.get("district") ?? ""),
      city: String(formData.get("city") ?? ""),
      address: String(formData.get("address") ?? ""),
      rooms: String(formData.get("rooms") ?? ""),
      area: String(formData.get("area") ?? ""),
      propertyType: String(formData.get("propertyType") ?? ""),
      rentType: String(formData.get("rentType") ?? selectedRentType),
      phone: String(formData.get("phone") ?? ""),
      images: overrideImages ?? imageUrls
    };

    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Best-effort — draft persistence should never block form use.
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore.
    }
  }

  const effectiveValues = restoredDraft
    ? {
        title: restoredDraft.title,
        description: restoredDraft.description,
        price: restoredDraft.price,
        region: restoredDraft.region as UzbekistanRegion | undefined,
        district: restoredDraft.district,
        city: restoredDraft.city,
        address: restoredDraft.address,
        rooms: restoredDraft.rooms,
        area: restoredDraft.area,
        propertyType: restoredDraft.propertyType as (typeof PROPERTY_TYPES)[number] | undefined,
        phone: restoredDraft.phone || initialPhone
      }
    : {
        title: initialValues?.title,
        description: initialValues?.description,
        price: initialValues?.price,
        region: initialValues?.region,
        district: initialValues?.district,
        city: initialValues?.city,
        address: initialValues?.address,
        rooms: initialValues?.rooms,
        area: initialValues?.area,
        propertyType: initialValues?.propertyType,
        phone: initialValues?.phone || initialPhone
      };

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
      setImageUrls((current) => {
        const next = [...current, ...uploaded];
        persistDraft(next);
        return next;
      });
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
    setImageUrls((current) => {
      const next = current.filter((image) => image !== url);
      persistDraft(next);
      return next;
    });
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

    if (mode === "create") {
      persistDraft();
    }

    try {
      const response = await fetch(submitPath, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401 && mode === "create") {
        // Draft is already saved — send the user to log in and back.
        router.push("/login?next=/add-listing");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? copy.submitUnable);
      }

      if (mode === "create") {
        clearDraft();
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

      {restoredDraft && copy.draftRestored ? (
        <div className="panel border-accent/25 bg-accent/5 p-4 text-sm font-medium text-accent">
          {copy.draftRestored}
        </div>
      ) : null}

      {!isAuthenticated && copy.loginToSubmit ? (
        <div className="panel border-line/80 bg-mist/45 p-4 text-sm leading-6 text-ink/70">
          {copy.loginToSubmit}
        </div>
      ) : null}

      <form
        ref={formRef}
        key={restoredDraft ? "draft" : "fresh"}
        onSubmit={handleSubmit}
        onChange={() => persistDraft()}
        className="panel space-y-8 p-6 sm:p-8"
      >
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
              defaultValue={effectiveValues.title ?? ""}
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
              defaultValue={effectiveValues.description ?? ""}
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
              defaultValue={effectiveValues.price ?? ""}
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
              defaultValue={effectiveValues.region ?? regionOptions[0]?.value}
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
              defaultValue={effectiveValues.district ?? ""}
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
              defaultValue={effectiveValues.city ?? ""}
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
              defaultValue={effectiveValues.address ?? ""}
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
              defaultValue={effectiveValues.rooms ?? ""}
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
              defaultValue={effectiveValues.area ?? ""}
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
              defaultValue={effectiveValues.propertyType ?? PROPERTY_TYPES[0]}
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
              defaultValue={effectiveValues.phone ?? ""}
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
