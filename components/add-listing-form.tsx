"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent
} from "react";

import { LocationSelect } from "@/components/location-select";
import { isLocalImageUrl } from "@/lib/image-url";
import {
  CURRENCIES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_TYPES,
  type CurrencyValue,
  type ListingTypeValue,
  type RentTypeValue
} from "@/lib/constants";
import type { UzbekistanRegion } from "@/lib/locations";

const DRAFT_STORAGE_KEY = "draft-listing";

function stripUzPrefix(phone: string) {
  return phone.startsWith("+998") ? phone.slice(4) : phone;
}

function doneUrls(items: PhotoItem[]) {
  return items.filter((item) => item.status === "done").map((item) => item.previewUrl);
}

type PhotoItem = {
  id: string;
  status: "uploading" | "done";
  previewUrl: string;
  progress?: number;
};

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
  districtOptionsByRegion: Record<string, Array<{ value: string; label: string }>>;
  listingTypeLabels: Record<(typeof LISTING_TYPES)[number], string>;
  propertyTypeLabels: Record<(typeof PROPERTY_TYPES)[number], string>;
  rentTypeLabels: Record<(typeof RENT_TYPES)[number], string>;
  copy: {
    success: string;
    draftRestored?: string;
    loginToSubmit?: string;
    sectionBasic: string;
    sectionPrice: string;
    sectionLocation: string;
    sectionDetails: string;
    sectionContact: string;
    sectionPhotos: string;
    listingType: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    rentPrice: string;
    salePrice: string;
    currency: string;
    region: string;
    districtCity: string;
    districtSelectPrompt: string;
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
    uploadCta: string;
    optionalSuffix: string;
    draftSaved: string;
    submit: string;
    submitting: string;
    uploading: string;
    uploadPreviewAlt: string;
    uploadUnable: string;
    submitUnable: string;
    removeImage: string;
    imagesRequired: string;
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
  districtOptionsByRegion,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listingType, setListingType] = useState<ListingTypeValue>(
    initialValues?.listingType ?? "rent"
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyValue>(
    initialValues?.currency ?? "USD"
  );
  const [selectedRentType, setSelectedRentType] = useState<RentTypeValue>(
    initialValues?.rentType ?? "monthly"
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    (initialValues?.images ?? []).map((url) => ({ id: url, status: "done" as const, previewUrl: url }))
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState<DraftValues | null>(null);
  const [hasSavedDraftOnce, setHasSavedDraftOnce] = useState(false);
  const [priceValue, setPriceValue] = useState<string>(
    initialValues?.price !== undefined ? String(initialValues.price) : ""
  );
  const [selectedRegion, setSelectedRegion] = useState<string>(
    initialValues?.region ?? regionOptions[0]?.value ?? ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialValues?.district ?? "");

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
      setHasSavedDraftOnce(true);

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
        setPhotos(parsed.images.map((url) => ({ id: url, status: "done" as const, previewUrl: url })));
      }
      if (parsed.price) {
        setPriceValue(parsed.price);
      }
      if (parsed.region) {
        setSelectedRegion(parsed.region);
      }
      if (parsed.district) {
        setSelectedDistrict(parsed.district);
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
      images: overrideImages ?? doneUrls(photos)
    };

    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setHasSavedDraftOnce(true);
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

  // XHR instead of fetch so upload progress is actually observable per file.
  function uploadSingleFile(file: File, onProgress: (percent: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        let payload: { url?: string; error?: string } = {};
        try {
          payload = JSON.parse(xhr.responseText);
        } catch {
          // Ignore — falls through to the generic error below.
        }

        if (xhr.status >= 200 && xhr.status < 300 && payload.url) {
          resolve(payload.url);
        } else {
          reject(new Error(payload.error ?? copy.uploadUnable));
        }
      };

      xhr.onerror = () => reject(new Error(copy.uploadUnable));

      const body = new FormData();
      body.append("file", file);
      xhr.send(body);
    });
  }

  function processFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 10 - photos.length);

    if (files.length === 0) {
      return;
    }

    setUploadError(null);

    const items: PhotoItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: "uploading",
      previewUrl: URL.createObjectURL(file),
      progress: 0
    }));

    setPhotos((current) => [...current, ...items]);

    files.forEach((file, index) => {
      const item = items[index];

      uploadSingleFile(file, (percent) => {
        setPhotos((current) =>
          current.map((photo) => (photo.id === item.id ? { ...photo, progress: percent } : photo))
        );
      })
        .then((url) => {
          URL.revokeObjectURL(item.previewUrl);
          setPhotos((current) => {
            const next = current.map((photo) =>
              photo.id === item.id ? { ...photo, status: "done" as const, previewUrl: url } : photo
            );
            persistDraft(doneUrls(next));
            return next;
          });
        })
        .catch((uploadIssue) => {
          URL.revokeObjectURL(item.previewUrl);
          setPhotos((current) => current.filter((photo) => photo.id !== item.id));
          setUploadError(uploadIssue instanceof Error ? uploadIssue.message : copy.uploadUnable);
        });
    });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    processFiles(event.target.files ?? []);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    processFiles(event.dataTransfer.files);
  }

  function removeImage(id: string) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target?.status === "uploading") {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = current.filter((photo) => photo.id !== id);
      persistDraft(doneUrls(next));
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const uploadedImages = doneUrls(photos);

    if (uploadedImages.length === 0) {
      setError(copy.imagesRequired);
      return;
    }

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
      phone: getValue("phone") ? `+998${getValue("phone")}` : "",
      images: uploadedImages
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
      : selectedCurrency;
  const parsedPrice = Number(priceValue);
  const formattedPricePreview =
    priceValue && Number.isFinite(parsedPrice) && parsedPrice > 0
      ? new Intl.NumberFormat("en-US").format(parsedPrice)
      : null;

  const baseDistrictOptions = districtOptionsByRegion[selectedRegion] ?? [];
  // A legacy or not-yet-normalized district value won't be in the canonical
  // list — keep it selectable instead of silently dropping it on save.
  const districtOptions =
    selectedDistrict && !baseDistrictOptions.some((option) => option.value === selectedDistrict)
      ? [{ value: selectedDistrict, label: selectedDistrict }, ...baseDistrictOptions]
      : baseDistrictOptions;

  const hasUploadingPhoto = photos.some((photo) => photo.status === "uploading");

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
        className="space-y-5"
      >
        <section className="space-y-3 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.listingType}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LISTING_TYPES.map((option) => {
              const checked = listingType === option;

              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-4 py-3 transition ${
                    checked
                      ? "border-accent bg-accent/5 shadow-sm"
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
                  <span className="font-medium text-ink">{listingTypeLabels[option]}</span>
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border ${
                      checked ? "border-accent bg-accent" : "border-line bg-white"
                    }`}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.sectionBasic}
          </h2>

          <div>
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

          <div>
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
        </section>

        <section className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.sectionPrice}
          </h2>

          <div className="grid grid-cols-2 gap-4">
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
                value={priceValue}
                onChange={(event) => setPriceValue(event.target.value)}
                placeholder="450"
              />
              {formattedPricePreview ? (
                <p className="mt-2 text-xs font-medium text-ink/50">
                  {formattedPricePreview} <span className="uppercase tracking-[0.1em]">{priceSuffix}</span>
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
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.sectionLocation}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <LocationSelect
              id="region"
              name="region"
              label={copy.region}
              value={selectedRegion}
              options={regionOptions}
              onChange={(event) => {
                const nextRegion = event.target.value;
                setSelectedRegion(nextRegion);

                const stillValid = (districtOptionsByRegion[nextRegion] ?? []).some(
                  (option) => option.value === selectedDistrict
                );

                if (!stillValid) {
                  setSelectedDistrict("");
                }
              }}
            />

            <div>
              <label htmlFor="district" className="mb-2 block text-sm font-medium text-ink/80">
                {copy.districtCity}
              </label>
              <select
                id="district"
                name="district"
                required
                className="select"
                value={selectedDistrict}
                onChange={(event) => setSelectedDistrict(event.target.value)}
              >
                <option value="">{copy.districtSelectPrompt}</option>
                {districtOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium text-ink/80">
                {copy.cityNeighborhood} <span className="font-normal text-ink/40">{copy.optionalSuffix}</span>
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
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.sectionDetails}
          </h2>

          <div className="grid grid-cols-2 gap-4">
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

            <div className={listingType === "rent" ? "" : "col-span-2"}>
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
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.sectionContact}
          </h2>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink/80">
              {copy.phone}
            </label>
            <div className="flex items-stretch overflow-hidden rounded-2xl border border-line bg-white transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
              <span className="flex items-center border-r border-line bg-mist px-4 text-sm font-medium text-ink/60">
                +998
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{9}"
                maxLength={9}
                required
                defaultValue={stripUzPrefix(effectiveValues.phone ?? "")}
                className="h-12 w-full flex-1 border-0 bg-transparent px-4 text-sm text-ink outline-none"
                placeholder="901234567"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            {copy.sectionPhotos}
          </h2>

          {photos.length > 0 ? (
            <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-[4/3] w-[42%] shrink-0 snap-start overflow-hidden rounded-[20px] border bg-white sm:w-[28%] lg:w-[18%]"
                >
                  <Image
                    src={photo.previewUrl}
                    alt={copy.uploadPreviewAlt}
                    fill
                    unoptimized={isLocalImageUrl(photo.previewUrl)}
                    className="object-cover"
                    sizes="(max-width: 1024px) 42vw, 18vw"
                  />

                  {photo.status === "uploading" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/55 text-white">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-6 w-6 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs font-semibold tabular-nums">{photo.progress ?? 0}%</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeImage(photo.id)}
                      aria-label={copy.removeImage}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white transition hover:bg-ink"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDraggingOver
                  ? "border-accent bg-accent/5"
                  : "border-line bg-mist/40 hover:border-ink/20 hover:bg-mist/60"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 text-ink/35"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4M12 4 7 9M12 4l5 5" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              <p className="mt-2 text-sm font-medium text-ink">{copy.uploadCta}</p>
              <input
                ref={fileInputRef}
                id="images"
                type="file"
                accept="image/*"
                multiple
                aria-label={copy.images}
                onChange={handleImageChange}
                className="sr-only"
              />
            </div>
            <p className="mt-2 text-sm text-ink/60">{copy.uploadNote}</p>
          </div>

          {uploadError ? (
            <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
              {uploadError}
            </div>
          ) : null}
        </section>

        {error ? (
          <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        ) : null}

        {mode === "create" && hasSavedDraftOnce ? (
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink/40">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {copy.draftSaved}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || hasUploadingPhoto}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === "edit"
              ? copy.updating ?? copy.submitting
              : copy.submitting
            : hasUploadingPhoto
              ? copy.uploading
              : mode === "edit"
                ? copy.updateSubmit ?? copy.submit
                : copy.submit}
        </button>
      </form>
    </div>
  );
}
