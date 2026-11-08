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

import { LocationPicker } from "@/components/location-picker";
import {
  AMENITY_LABELS,
  INCLUDED_IN_PRICE_LABELS,
  TENANT_PREFERENCE_LABELS
} from "@/lib/amenity-labels";
import { getDistrictCentroid } from "@/lib/district-coordinates";
import { isLocalImageUrl } from "@/lib/image-url";
import {
  AMENITY_KEYS,
  CURRENCIES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_INCLUDED_IN_PRICE_KEYS,
  RENT_PREFERENCE_KEYS,
  RENT_TYPES,
  SALE_CONDITION_KEYS,
  SALE_INCLUDED_IN_PRICE_KEYS,
  type AmenityKey,
  type CurrencyValue,
  type FurnishingStatusValue,
  type IncludedInPriceKey,
  type ListingTypeValue,
  type PropertyTypeValue,
  type RentTypeValue,
  type TenantPreferenceKey
} from "@/lib/constants";
import type { UzbekistanRegion } from "@/lib/locations";

const FALLBACK_MAP_CENTER = { lat: 41.311158, lng: 69.279737 };
const DRAFT_STORAGE_KEY = "draft-listing-v3";

function stripUzPrefix(phone: string) {
  return phone.replace(/^\+?998/, "").trim();
}

function splitFullName(fullName?: string | null): { firstName: string; lastName: string } {
  const cleaned = (fullName ?? "").trim();
  if (!cleaned) {
    return { firstName: "", lastName: "" };
  }
  const parts = cleaned.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ")
  };
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
  listingType?: ListingTypeValue;
  propertyType?: PropertyTypeValue;
  rentType?: RentTypeValue;
  rooms?: string;
  area?: string;
  floor?: string;
  totalFloors?: string;
  plotArea?: string;
  region?: string;
  district?: string;
  city?: string;
  street?: string;
  address?: string;
  furnishing?: FurnishingStatusValue;
  amenities?: string[];
  tenantPreferences?: string[];
  includedInPrice?: string[];
  title?: string;
  description?: string;
  price?: string;
  currency?: CurrencyValue;
  negotiable?: boolean;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  phone?: string;
  images?: string[];
};

type AddListingFormProps = {
  mode?: "create" | "edit";
  locale?: "uz" | "ru";
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
  furnishingLabels: Record<FurnishingStatusValue, string>;
  copy: {
    success: string;
    draftRestored?: string;
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
    mapLocation: string;
    mapLocationHelper: string;
    useMyLocation: string;
    locating: string;
    locateError: string;
    mapLocationNotSet: string;
    locationRequired: string;
    rooms: string;
    area: string;
    propertyType: string;
    rentType: string;
    furnishing: string;
    furnishingNotSpecified: string;
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
  initialName?: string | null;
  initialEmail?: string | null;
  initialValues?: {
    listingType: ListingTypeValue;
    title: string;
    description: string;
    price: number;
    currency: CurrencyValue;
    region: UzbekistanRegion;
    district: string;
    city: string | null;
    street?: string | null;
    address: string;
    rooms: number;
    area: number;
    floor?: number | null;
    totalFloors?: number | null;
    plotArea?: number | null;
    propertyType: (typeof PROPERTY_TYPES)[number];
    rentType: RentTypeValue | null;
    furnishing: FurnishingStatusValue | null;
    negotiable?: boolean;
    amenities?: string[];
    tenantPreferences?: string[];
    includedInPrice?: string[];
    contactName?: string | null;
    contactEmail?: string | null;
    latitude: number;
    longitude: number;
    phone: string;
    images: string[];
  };
};

function AmenityIcon({ name }: { name: AmenityKey }) {
  const cls = "h-4 w-4 shrink-0";
  switch (name) {
    case "heating":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c1.5 3 4 5 4 9a4 4 0 1 1-8 0c0-2.5 1.5-4.5 2-6 1 1.5 2 2 2 0z" />
          <path d="M8 21h8" />
        </svg>
      );
    case "ac":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="8" rx="2" />
          <path d="M6 8h12M7 16c0 2-1.5 3-1.5 3M12 16v4M17 16c0 2 1.5 3 1.5 3" />
        </svg>
      );
    case "washer":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <circle cx="12" cy="13" r="4" />
          <path d="M8 6h.01M11 6h.01" />
        </svg>
      );
    case "fridge":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M5 10h14M8 6v2M8 13v3" />
        </svg>
      );
    case "wifi":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" />
        </svg>
      );
    case "pool":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 16c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0" />
          <path d="M2 20c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0" />
          <path d="M7 12V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7" />
          <path d="M7 8h10" />
        </svg>
      );
    case "tv":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="13" rx="2" />
          <path d="M8 21h8M12 18v3" />
        </svg>
      );
    case "kitchen":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 11h18M9 11v9M15 11v9M7 7.5h.01M11 7.5h.01" />
        </svg>
      );
    case "balcony":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h18v6H3z" />
          <path d="M7 14v6M12 14v6M17 14v6M6 14V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9" />
        </svg>
      );
    case "elevator":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="m9 9 3-3 3 3M15 15l-3 3-3-3" />
        </svg>
      );
    case "metro":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="15" rx="3" />
          <path d="M5 11h14M8 15h.01M16 15h.01M7 18l-2 3M17 18l2 3" />
        </svg>
      );
    case "parking":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
        </svg>
      );
    case "sauna":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4c0 2 2 2 2 4s-2 2-2 4M12 4c0 2 2 2 2 4s-2 2-2 4M17 4c0 2 2 2 2 4s-2 2-2 4" />
          <path d="M4 16h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3z" />
        </svg>
      );
    case "garden":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22v-8M7 14c-2.5 0-4.5-2-4.5-4.5a4.5 4.5 0 0 1 5-4.46A5.5 5.5 0 0 1 18 7.5a4.5 4.5 0 0 1-1 8.89H7z" />
        </svg>
      );
    case "bbq":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 10h14a7 7 0 0 1-14 0z" />
          <path d="M9 17l-2 4M15 17l2 4M8 6V4M12 6V3M16 6V4" />
        </svg>
      );
    case "security":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

function PropertyTypeIcon({ type }: { type: PropertyTypeValue }) {
  const cls = "h-5 w-5 shrink-0";
  switch (type) {
    case "flat":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
        </svg>
      );
    case "house":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
          <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
        </svg>
      );
    case "room":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
        </svg>
      );
    case "studio":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
          <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
          <path d="M4 18v2M20 18v2" />
        </svg>
      );
  }
}

export function AddListingForm({
  mode = "create",
  locale = "uz",
  submitPath = "/api/listings",
  successPath = "/add-listing?success=1",
  regionOptions,
  districtOptionsByRegion,
  propertyTypeLabels,
  rentTypeLabels,
  furnishingLabels,
  copy,
  showSuccess = false,
  initialPhone,
  initialName,
  initialEmail,
  initialValues
}: AddListingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSplitName = splitFullName(initialValues?.contactName ?? initialName);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [listingType, setListingType] = useState<ListingTypeValue>(
    initialValues?.listingType ?? "rent"
  );
  const [propertyType, setPropertyType] = useState<PropertyTypeValue>(
    initialValues?.propertyType ?? "flat"
  );
  const [selectedRentType, setSelectedRentType] = useState<RentTypeValue>(
    initialValues?.rentType ?? "monthly"
  );
  const [rooms, setRooms] = useState<string>(
    initialValues?.rooms !== undefined ? String(initialValues.rooms) : "2"
  );
  const [area, setArea] = useState<string>(
    initialValues?.area !== undefined ? String(initialValues.area) : "65"
  );
  const [floor, setFloor] = useState<string>(
    initialValues?.floor !== undefined && initialValues?.floor !== null
      ? String(initialValues.floor)
      : "3"
  );
  const [totalFloors, setTotalFloors] = useState<string>(
    initialValues?.totalFloors !== undefined && initialValues?.totalFloors !== null
      ? String(initialValues.totalFloors)
      : "9"
  );
  const [plotArea, setPlotArea] = useState<string>(
    initialValues?.plotArea !== undefined && initialValues?.plotArea !== null
      ? String(initialValues.plotArea)
      : "4"
  );

  // Step 2: Location
  const [selectedRegion, setSelectedRegion] = useState<string>(
    initialValues?.region ?? regionOptions[0]?.value ?? "Tashkent City"
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    initialValues?.district ??
      (districtOptionsByRegion[initialValues?.region ?? regionOptions[0]?.value ?? "Tashkent City"]?.[0]?.value ?? "")
  );
  const [street, setStreet] = useState<string>(initialValues?.street ?? "");
  const [address, setAddress] = useState<string>(initialValues?.address ?? "");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialValues
      ? { lat: initialValues.latitude, lng: initialValues.longitude }
      : getDistrictCentroid(
          regionOptions[0]?.value ?? "Tashkent City",
          districtOptionsByRegion[regionOptions[0]?.value ?? "Tashkent City"]?.[0]?.value ?? ""
        ) ?? FALLBACK_MAP_CENTER
  );

  // Step 3: Amenities & Comfort
  const [furnishing, setFurnishing] = useState<FurnishingStatusValue>(
    initialValues?.furnishing ?? "FURNISHED"
  );
  const [tenantPreferences, setTenantPreferences] = useState<string[]>(
    initialValues?.tenantPreferences ??
      (initialValues?.listingType === "sale" ? ["cadastr_ready"] : ["family"])
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialValues?.amenities ?? ["heating", "ac", "washer", "fridge", "wifi"]
  );

  // Step 4: Photos & Title/Description
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    (initialValues?.images ?? []).map((url) => ({
      id: url,
      status: "done" as const,
      previewUrl: url
    }))
  );
  const [title, setTitle] = useState<string>(initialValues?.title ?? "");
  const [description, setDescription] = useState<string>(initialValues?.description ?? "");

  // Step 5: Price, What's Included in Price, Contact Info & Final Review
  const [priceValue, setPriceValue] = useState<string>(
    initialValues?.price !== undefined ? String(initialValues.price) : ""
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyValue>(
    initialValues?.currency ?? "USD"
  );
  const [negotiable, setNegotiable] = useState<boolean>(
    initialValues?.negotiable ?? true
  );
  const [includedInPrice, setIncludedInPrice] = useState<string[]>(
    initialValues?.includedInPrice ?? ["no_commission"]
  );
  const [contactFirstName, setContactFirstName] = useState<string>(initialSplitName.firstName);
  const [contactLastName, setContactLastName] = useState<string>(initialSplitName.lastName);
  const [contactEmail, setContactEmail] = useState<string>(
    initialValues?.contactEmail ?? initialEmail ?? ""
  );
  const [phone, setPhone] = useState<string>(
    stripUzPrefix(initialValues?.phone ?? initialPhone ?? "")
  );

  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Restore draft on mount (create mode)
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
      if (parsed.listingType) setListingType(parsed.listingType);
      if (parsed.propertyType) setPropertyType(parsed.propertyType);
      if (parsed.rentType) setSelectedRentType(parsed.rentType);
      if (parsed.rooms) setRooms(parsed.rooms);
      if (parsed.area) setArea(parsed.area);
      if (parsed.floor !== undefined) setFloor(parsed.floor);
      if (parsed.totalFloors !== undefined) setTotalFloors(parsed.totalFloors);
      if (parsed.plotArea !== undefined) setPlotArea(parsed.plotArea);
      if (parsed.region) setSelectedRegion(parsed.region);
      if (parsed.district) setSelectedDistrict(parsed.district);
      if (parsed.street !== undefined) setStreet(parsed.street);
      if (parsed.address !== undefined) setAddress(parsed.address);
      if (parsed.furnishing) setFurnishing(parsed.furnishing);
      if (Array.isArray(parsed.amenities)) setAmenities(parsed.amenities);
      if (Array.isArray(parsed.tenantPreferences)) setTenantPreferences(parsed.tenantPreferences);
      if (Array.isArray(parsed.includedInPrice)) setIncludedInPrice(parsed.includedInPrice);
      if (parsed.title !== undefined) setTitle(parsed.title);
      if (parsed.description !== undefined) setDescription(parsed.description);
      if (parsed.price !== undefined) setPriceValue(parsed.price);
      if (parsed.currency) setSelectedCurrency(parsed.currency);
      if (parsed.negotiable !== undefined) setNegotiable(parsed.negotiable);
      if (parsed.contactFirstName) setContactFirstName(parsed.contactFirstName);
      if (parsed.contactLastName) setContactLastName(parsed.contactLastName);
      if (parsed.contactEmail !== undefined) setContactEmail(parsed.contactEmail);
      if (parsed.phone) setPhone(parsed.phone);
      if (Array.isArray(parsed.images) && parsed.images.length > 0) {
        setPhotos(
          parsed.images.map((url) => ({ id: url, status: "done" as const, previewUrl: url }))
        );
      }
      setHasRestoredDraft(true);
    } catch {
      // Ignore malformed draft
    }
  }, [mode]);

  // Save draft whenever form state changes
  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    const draft: DraftValues = {
      listingType,
      propertyType,
      rentType: selectedRentType,
      rooms,
      area,
      floor,
      totalFloors,
      plotArea,
      region: selectedRegion,
      district: selectedDistrict,
      street,
      address,
      furnishing,
      amenities,
      tenantPreferences,
      includedInPrice,
      title,
      description,
      price: priceValue,
      currency: selectedCurrency,
      negotiable,
      contactFirstName,
      contactLastName,
      contactEmail,
      phone,
      images: doneUrls(photos)
    };

    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    mode,
    listingType,
    propertyType,
    selectedRentType,
    rooms,
    area,
    floor,
    totalFloors,
    plotArea,
    selectedRegion,
    selectedDistrict,
    street,
    address,
    furnishing,
    amenities,
    tenantPreferences,
    includedInPrice,
    title,
    description,
    priceValue,
    selectedCurrency,
    negotiable,
    contactFirstName,
    contactLastName,
    contactEmail,
    phone,
    photos
  ]);

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  // Filter amenities based on propertyType so apartment/room/studio doesn't show yard-only items and house doesn't show apartment elevator
  const visibleAmenityKeys = AMENITY_KEYS.filter((key) => {
    if (propertyType === "house") {
      return key !== "elevator";
    }
    return key !== "garden" && key !== "bbq";
  });

  // Active preference keys for Step 3 based on dealType (rent vs sale)
  const activePreferenceKeys: readonly TenantPreferenceKey[] =
    listingType === "sale" ? SALE_CONDITION_KEYS : RENT_PREFERENCE_KEYS;

  // Active includedInPrice keys for Step 5 based on dealType (rent vs sale)
  const activeIncludedKeys: readonly IncludedInPriceKey[] =
    listingType === "sale" ? SALE_INCLUDED_IN_PRICE_KEYS : RENT_INCLUDED_IN_PRICE_KEYS;

  // District options for selected region
  const baseDistrictOptions = districtOptionsByRegion[selectedRegion] ?? [];
  const districtOptions =
    selectedDistrict && !baseDistrictOptions.some((option) => option.value === selectedDistrict)
      ? [{ value: selectedDistrict, label: selectedDistrict }, ...baseDistrictOptions]
      : baseDistrictOptions;

  const currentRegionLabel =
    regionOptions.find((r) => r.value === selectedRegion)?.label ?? selectedRegion;
  const currentDistrictLabel =
    districtOptions.find((d) => d.value === selectedDistrict)?.label ?? selectedDistrict;

  // Smart Auto-Generated Title & Description helpers
  function generateSmartTitle() {
    const propLabel =
      propertyType === "house"
        ? locale === "ru"
          ? "дом / участок"
          : "hovli uy"
        : propertyTypeLabels[propertyType].toLowerCase();
    const locPrefix = currentDistrictLabel || currentRegionLabel;
    const floorPart =
      propertyType === "house"
        ? plotArea
          ? `${plotArea} ${locale === "ru" ? "сот." : "sotix"}`
          : ""
        : floor && totalFloors
          ? `${floor}/${totalFloors} ${locale === "ru" ? "этаж" : "qavat"}`
          : "";
    if (locale === "ru") {
      return [
        locPrefix ? `${locPrefix}:` : "",
        propertyType === "studio" ? propLabel : `${rooms || 2}-комн. ${propLabel}`,
        area ? `${area} м²` : "",
        floorPart
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return [
      locPrefix ? `${locPrefix}da` : "",
      propertyType === "studio" ? propLabel : `${rooms || 2} xonali ${propLabel}`,
      area ? `${area} m²` : "",
      floorPart
    ]
      .filter(Boolean)
      .join(", ")
      .replace(/^,\s*/, "")
      .trim();
  }

  function generateSmartDescription() {
    const activeAmenities = amenities.filter((a) =>
      visibleAmenityKeys.includes(a as AmenityKey)
    );
    const amenityNames = activeAmenities
      .map((a) => (AMENITY_LABELS[locale] as Record<string, string>)[a])
      .filter(Boolean);
    const activePrefs = tenantPreferences.filter((tp) =>
      activePreferenceKeys.includes(tp as TenantPreferenceKey)
    );
    const tenantNames = activePrefs
      .map((tp) => (TENANT_PREFERENCE_LABELS[locale] as Record<string, string>)[tp])
      .filter(Boolean);

    const floorSentence =
      propertyType === "house"
        ? plotArea
          ? locale === "ru"
            ? `Участок ${plotArea} соток, ${totalFloors || 1}-этажный дом, общая площадь ${area || 65} м².`
            : `${plotArea} sotixli, ${totalFloors || 1} qavatli shinam uy, umumiy maydoni ${area || 65} m².`
          : ""
        : floor && totalFloors
          ? locale === "ru"
            ? `Расположена на ${floor} этаже ${totalFloors}-этажного дома, общая площадь ${area || 65} м².`
            : `${totalFloors} qavatli binoning ${floor}-qavatida joylashgan, umumiy maydoni ${area || 65} m².`
          : "";

    const locSentence = [street.trim(), address.trim()].filter(Boolean).join(", ");

    if (locale === "ru") {
      return [
        `${currentDistrictLabel || currentRegionLabel}${locSentence ? ` (${locSentence})` : ""} — ${
          listingType === "sale" ? "продается" : "сдается"
        } ${propertyType === "studio" ? "студия" : `${rooms || 2}-комнатная ${propertyTypeLabels[propertyType].toLowerCase()}`}.`,
        floorSentence,
        amenityNames.length > 0 ? `В доме есть: ${amenityNames.join(", ")}.` : "",
        tenantNames.length > 0
          ? listingType === "sale"
            ? `Преимущества: ${tenantNames.join(", ")}.`
            : `Подходит: ${tenantNames.join(", ")}.`
          : ""
      ]
        .filter(Boolean)
        .join(" ");
    }

    return [
      `${currentDistrictLabel || currentRegionLabel}da${locSentence ? ` (${locSentence})` : ""} barcha qulayliklarga ega ${
        propertyType === "studio"
          ? "studiya xonadon"
          : `${rooms || 2} xonali ${propertyType === "house" ? "hovli uy" : propertyTypeLabels[propertyType].toLowerCase()}`
      } ${listingType === "sale" ? "sotiladi" : "ijaraga beriladi"}.`,
      floorSentence,
      amenityNames.length > 0 ? `Uyda mavjud: ${amenityNames.join(", ")}.` : "",
      tenantNames.length > 0
        ? listingType === "sale"
          ? `Holati va hujjatlar: ${tenantNames.join(", ")}.`
          : `${tenantNames.join(", ")} uchun juda qulay.`
        : ""
    ]
      .filter(Boolean)
      .join(" ");
  }

  function goToStep(nextStep: 1 | 2 | 3 | 4 | 5) {
    setError(null);
    if (nextStep === 4) {
      if (!title.trim()) {
        setTitle(generateSmartTitle());
      }
      if (!description.trim()) {
        setDescription(generateSmartDescription());
      }
    }
    setStep(nextStep);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleNextStep() {
    setError(null);

    if (step === 1) {
      const areaNum = Number(area);
      if (!areaNum || areaNum < 10) {
        setError(
          locale === "ru"
            ? "Укажите площадь (минимум 10 м²)."
            : "Umumiy maydonni kiriting (kamida 10 m²)."
        );
        return;
      }
      if (propertyType !== "house" && floor && totalFloors && Number(floor) > Number(totalFloors)) {
        setError(
          locale === "ru"
            ? "Этаж квартиры не может быть больше этажности дома."
            : "Kvartira qavati bino qavatlari sonidan katta bo'lishi mumkin emas."
        );
        return;
      }
      goToStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedDistrict.trim()) {
        setError(locale === "ru" ? "Выберите район или город." : "Tuman yoki shaharni tanlang.");
        return;
      }
      if (!address.trim() && !street.trim()) {
        setError(
          locale === "ru"
            ? "Укажите улицу или ориентир."
            : "Ko'cha yoki mo'ljalni kiriting."
        );
        return;
      }
      if (!position) {
        const fallback =
          getDistrictCentroid(selectedRegion, selectedDistrict) ?? FALLBACK_MAP_CENTER;
        setPosition(fallback);
      }
      goToStep(3);
      return;
    }

    if (step === 3) {
      goToStep(4);
      return;
    }

    if (step === 4) {
      const uploadedImages = doneUrls(photos);
      if (uploadedImages.length === 0) {
        setError(copy.imagesRequired);
        return;
      }
      if (title.trim().length < 5) {
        setError(
          locale === "ru"
            ? "Заголовок должен содержать минимум 5 символов."
            : "Sarlavha kamida 5 ta belgidan iborat bo'lishi kerak."
        );
        return;
      }
      if (description.trim().length < 20) {
        setError(
          locale === "ru"
            ? "Описание должно содержать минимум 20 символов."
            : "Tavsif kamida 20 ta belgidan iborat bo'lishi kerak."
        );
        return;
      }
      goToStep(5);
    }
  }

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
          // Ignore
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
          setPhotos((current) =>
            current.map((photo) =>
              photo.id === item.id ? { ...photo, status: "done" as const, previewUrl: url } : photo
            )
          );
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
      return current.filter((photo) => photo.id !== id);
    });
  }

  function toggleAmenity(key: AmenityKey) {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  function toggleTenantPref(key: TenantPreferenceKey) {
    setTenantPreferences((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  function toggleIncludedInPrice(key: IncludedInPriceKey) {
    setIncludedInPrice((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }
      let next = [...prev, key];
      // Smart mutual exclusion for contradictory utility/deposit options
      if (key === "utilities_included") {
        next = next.filter((item) => item !== "utilities_separate");
      } else if (key === "utilities_separate") {
        next = next.filter((item) => item !== "utilities_included");
      } else if (key === "no_deposit") {
        next = next.filter((item) => item !== "deposit_required");
      } else if (key === "deposit_required") {
        next = next.filter((item) => item !== "no_deposit");
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (step < 5) {
      handleNextStep();
      return;
    }

    const uploadedImages = doneUrls(photos);
    if (uploadedImages.length === 0) {
      setError(copy.imagesRequired);
      setStep(4);
      return;
    }

    const finalTitle = title.trim() || generateSmartTitle();
    const finalDescription = description.trim() || generateSmartDescription();
    const finalAddress = address.trim() || street.trim() || currentDistrictLabel;
    const finalPosition =
      position ?? getDistrictCentroid(selectedRegion, selectedDistrict) ?? FALLBACK_MAP_CENTER;

    if (!priceValue || Number(priceValue) <= 0) {
      setError(locale === "ru" ? "Укажите цену." : "Narxni kiriting.");
      return;
    }

    if (!contactFirstName.trim() || !contactLastName.trim()) {
      setError(
        locale === "ru"
          ? "Пожалуйста, укажите ваше имя и фамилию."
          : "Iltimos, ismingiz va familiyangizni kiriting."
      );
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, "").length < 7) {
      setError(locale === "ru" ? "Укажите номер телефона." : "Telefon raqamingizni kiriting.");
      return;
    }

    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setError(
        locale === "ru"
          ? "Введите корректный адрес электронной почты (Gmail)."
          : "To'g'ri elektron pochta (Gmail) manzilini kiriting."
      );
      return;
    }

    setIsSubmitting(true);

    const filteredAmenities = amenities.filter((a) =>
      visibleAmenityKeys.includes(a as AmenityKey)
    );
    const filteredPreferences = tenantPreferences.filter((tp) =>
      activePreferenceKeys.includes(tp as TenantPreferenceKey)
    );
    const filteredIncluded = includedInPrice.filter((inc) =>
      activeIncludedKeys.includes(inc as IncludedInPriceKey)
    );
    const fullContactName = `${contactFirstName.trim()} ${contactLastName.trim()}`.trim();

    const payload = {
      listingType,
      title: finalTitle,
      description: finalDescription,
      price: Number(priceValue),
      currency: selectedCurrency,
      region: selectedRegion,
      district: selectedDistrict,
      city: street.trim() || null,
      street: street.trim() || null,
      address: finalAddress,
      rooms: propertyType === "studio" ? 1 : Number(rooms) || 2,
      area: Number(area) || 65,
      floor: propertyType !== "house" && floor ? Number(floor) : null,
      totalFloors: totalFloors ? Number(totalFloors) : null,
      plotArea: propertyType === "house" && plotArea ? Number(plotArea) : null,
      propertyType,
      rentType: listingType === "rent" ? selectedRentType : null,
      furnishing,
      negotiable,
      amenities: filteredAmenities,
      tenantPreferences: filteredPreferences,
      includedInPrice: filteredIncluded,
      contactName: fullContactName,
      contactEmail: contactEmail.trim().toLowerCase() || null,
      latitude: finalPosition.lat,
      longitude: finalPosition.lng,
      phone: `+998${phone.replace(/\D/g, "")}`,
      images: uploadedImages
    };

    try {
      const response = await fetch(submitPath, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401 && mode === "create") {
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

  const hasUploadingPhoto = photos.some((photo) => photo.status === "uploading");

  const steps: Array<{ id: 1 | 2 | 3 | 4 | 5; label: string; nextTitle: string }> =
    locale === "ru"
      ? [
          { id: 1, label: "1. Тип дома", nextTitle: "Далее: Адрес" },
          { id: 2, label: "2. Адрес", nextTitle: "Далее: Удобства" },
          { id: 3, label: "3. Удобства", nextTitle: "Далее: Фото" },
          { id: 4, label: "4. Фото", nextTitle: "Далее: Цена и проверка" },
          { id: 5, label: "5. Цена и отправка", nextTitle: "" }
        ]
      : [
          { id: 1, label: "1. Uy turi", nextTitle: "Davom etish: Manzil" },
          { id: 2, label: "2. Manzil", nextTitle: "Davom etish: Qulaylik" },
          { id: 3, label: "3. Qulaylik", nextTitle: "Davom etish: Rasmlar" },
          { id: 4, label: "4. Rasmlar", nextTitle: "Davom etish: Narx va Tekshiruv" },
          { id: 5, label: "5. Narx va Yuborish", nextTitle: "" }
        ];

  const propertySubtitles: Record<PropertyTypeValue, string> =
    locale === "ru"
      ? {
          flat: "Многоэтажный дом",
          house: "Участок / двор",
          room: "Отдельная комната",
          studio: "Открытая 1-комн."
        }
      : {
          flat: "Ko'p qavatli",
          house: "Uchastka",
          room: "Alohida xona",
          studio: "Ochiq 1 xonali"
        };

  // Live Preview Card computed values
  const previewPrice = Number(priceValue) > 0 ? Number(priceValue) : 400;
  const previewPriceFormatted =
    selectedCurrency === "USD"
      ? `$${new Intl.NumberFormat("en-US").format(previewPrice)}${
          listingType === "rent"
            ? selectedRentType === "daily"
              ? copy.perDay
              : copy.perMonth
            : ""
        }`
      : `${new Intl.NumberFormat("en-US").format(previewPrice)} UZS${
          listingType === "rent"
            ? selectedRentType === "daily"
              ? copy.perDay
              : copy.perMonth
            : ""
        }`;

  const previewFloorSpec =
    propertyType === "house"
      ? `${plotArea || 4} ${locale === "ru" ? "сот." : "sotix"} · ${totalFloors || 2} ${locale === "ru" ? "эт." : "qavat"}`
      : `${floor || 3}/${totalFloors || 9} ${locale === "ru" ? "эт." : "qavat"}`;

  const previewTitle = title.trim() || generateSmartTitle();
  const previewLocation = [currentDistrictLabel || currentRegionLabel, street.trim() || address.trim()]
    .filter(Boolean)
    .join(" · ");
  const uploadedPhotoUrls = doneUrls(photos);
  const previewCoverUrl = uploadedPhotoUrls[0];
  const activeIncludedList = includedInPrice.filter((inc) =>
    activeIncludedKeys.includes(inc as IncludedInPriceKey)
  );
  const activeAmenityList = amenities.filter((a) =>
    visibleAmenityKeys.includes(a as AmenityKey)
  );
  const activePrefList = tenantPreferences.filter((tp) =>
    activePreferenceKeys.includes(tp as TenantPreferenceKey)
  );

  return (
    <div className="space-y-5">
      {showSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 shadow-xs">
          ✓ {copy.success}
        </div>
      ) : null}

      {hasRestoredDraft && copy.draftRestored ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-[#EFF6FF] px-4 py-3 text-xs font-bold text-blue-800 sm:text-sm">
          <span>{copy.draftRestored}</span>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
            ● {locale === "ru" ? "Автосохранено" : "Avto-saqlangan"}
          </span>
        </div>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* Left Column: 5-Step Wizard Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Top Step Progress Header Card */}
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-3 shadow-[0_6px_20px_-6px_rgba(15,23,42,0.06)] sm:rounded-[24px] sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-extrabold text-slate-900 sm:text-base">
                {steps.find((s) => s.id === step)?.label}
              </span>
              <span className="rounded-full border border-blue-200 bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600 sm:text-[11px]">
                {step} / 5 {locale === "ru" ? "шаг" : "qadam"}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-5 gap-1.5 sm:mt-3 sm:gap-2">
              {steps.map((s) => {
                const isCurrent = s.id === step;
                const isDone = s.id < step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToStep(s.id)}
                    className="group flex flex-col gap-1.5 text-left focus:outline-none"
                  >
                    <span
                      className={`h-1.5 w-full rounded-full transition-all ${
                        isCurrent
                          ? "bg-blue-600"
                          : isDone
                            ? "bg-blue-400"
                            : "bg-slate-200 group-hover:bg-slate-300"
                      }`}
                    />
                    <span
                      className={`truncate text-[10px] font-extrabold transition sm:text-[11px] ${
                        isCurrent
                          ? "text-blue-600"
                          : isDone
                            ? "text-slate-700"
                            : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 sm:text-sm">
              {error}
            </div>
          ) : null}

          {/* STEP 1: E'lon turi, Mulk turi, Xonalar soni, va Qavati (Chapda) + Maydon (O'ngda) */}
          {step === 1 ? (
            <section className="space-y-3.5 rounded-[22px] border border-slate-200/90 bg-white p-3.5 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:space-y-5 sm:rounded-[24px] sm:p-6">
              {/* E'lon turi */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {locale === "ru" ? "Тип объявления" : "E'lon turi"}
                  </span>
                  {listingType === "rent" ? (
                    <div className="inline-flex rounded-lg border border-slate-200 bg-[#F3F6FB] p-0.5">
                      {RENT_TYPES.map((rt) => (
                        <button
                          key={rt}
                          type="button"
                          onClick={() => setSelectedRentType(rt)}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold transition ${
                            selectedRentType === rt
                              ? "bg-white text-blue-600 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {rentTypeLabels[rt]}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                  <button
                    type="button"
                    onClick={() => setListingType("rent")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-extrabold transition sm:py-2.5 sm:text-sm ${
                      listingType === "rent"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="7.5" cy="15.5" r="4.5" />
                      <path d="m21 2-9.6 9.6M15.5 7.5l3 3" />
                    </svg>
                    <span>{locale === "ru" ? "Сдать в аренду" : "Ijaraga berish"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListingType("sale")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-extrabold transition sm:py-2.5 sm:text-sm ${
                      listingType === "sale"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span>{locale === "ru" ? "Выставить на продажу" : "Sotuvga qo'yish"}</span>
                  </button>
                </div>
              </div>

              {/* Mulk turi */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {locale === "ru" ? "Тип недвижимости" : "Mulk turi"}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {locale === "ru" ? "Выберите" : "Tanlang"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {(["flat", "house", "room", "studio"] as const).map((type) => {
                    const active = propertyType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setPropertyType(type);
                          if (type === "studio") {
                            setRooms("1");
                          } else if (type === "room" && Number(rooms) > 3) {
                            setRooms("1");
                          }
                        }}
                        className={`relative flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          active
                            ? "border-blue-600 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]/60 shadow-[0_6px_16px_-6px_rgba(37,99,235,0.2)]"
                            : "border-slate-200 bg-[#F3F6FB] hover:border-slate-300 hover:bg-slate-100/80"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                            active
                              ? "border-blue-200 bg-white text-blue-600 shadow-xs"
                              : "border-slate-200/80 bg-white text-slate-600"
                          }`}
                        >
                          <PropertyTypeIcon type={type} />
                        </span>
                        <div className="min-w-0 pr-4">
                          <span className="block truncate text-xs font-extrabold text-slate-900 sm:text-sm">
                            {type === "house"
                              ? locale === "ru"
                                ? "Дом / Участок"
                                : "Hovli / Uy"
                              : propertyTypeLabels[type]}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                            {propertySubtitles[type]}
                          </span>
                        </div>
                        {active ? (
                          <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Xonalar soni — adapts to propertyType (locked to 1 for Studiya) */}
              {propertyType === "studio" ? (
                <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-[#EFF6FF] px-3.5 py-2.5 text-xs font-extrabold text-blue-800">
                  <span>
                    {locale === "ru"
                      ? "Студия — открытая планировка (1 комната)"
                      : "Studiya — ochiq rejali 1 xonali xonadon"}
                  </span>
                  <span className="rounded-lg bg-blue-600 px-2 py-0.5 text-[11px] text-white">
                    1 {locale === "ru" ? "комн." : "xona"}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                      {propertyType === "room"
                        ? locale === "ru"
                          ? "Количество сдаваемых комнат"
                          : "Topshiriladigan xonalar soni"
                        : locale === "ru"
                          ? "Количество комнат"
                          : "Xonalar soni"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {(["1", "2", "3", "4", "5"] as const).map((r) => {
                      const active = rooms === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRooms(r)}
                          className={`flex h-11 items-center justify-center rounded-xl border text-sm font-extrabold transition ${
                            active
                              ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                              : "border-slate-200 bg-[#F3F6FB] text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {r === "5" ? "5+" : r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SINGLE-LINE ROW: Left = Qavati (Etaj) / Sotix, Right = Umumiy maydon */}
              <div className="grid grid-cols-2 gap-3">
                {/* LEFT SIDE: Floor (for Flat/Room/Studio) OR Sotix+Floors (for House) */}
                {propertyType !== "house" ? (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="floor-input" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                        {locale === "ru" ? "Этаж" : "Qavati (Etaj)"}
                      </label>
                      <span className="text-[11px] font-extrabold text-blue-600">
                        {floor || "—"} / {totalFloors || "—"}
                      </span>
                    </div>
                    <div className="flex h-12 items-center rounded-2xl border border-slate-300/90 bg-[#F3F6FB] px-2.5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15">
                      <input
                        id="floor-input"
                        type="number"
                        min="0"
                        max="100"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="3"
                        aria-label={locale === "ru" ? "Этаж квартиры" : "Kvartira qavati"}
                        className="w-full min-w-0 bg-transparent text-center text-sm font-extrabold text-slate-900 outline-none"
                      />
                      <span className="px-1 font-extrabold text-blue-600">/</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={totalFloors}
                        onChange={(e) => setTotalFloors(e.target.value)}
                        placeholder="9"
                        aria-label={locale === "ru" ? "Всего этажей в доме" : "Bino qavatlari soni"}
                        className="w-full min-w-0 bg-transparent text-center text-sm font-extrabold text-slate-900 outline-none"
                      />
                      <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-slate-500">
                        {locale === "ru" ? "этаж" : "qavat"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="plot-input" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                        {locale === "ru" ? "Соток и этажи" : "Sotix va qavat"}
                      </label>
                      <span className="text-[11px] font-extrabold text-blue-600">
                        {plotArea || "—"} {locale === "ru" ? "сот" : "sot"}
                      </span>
                    </div>
                    <div className="flex h-12 items-center rounded-2xl border border-slate-300/90 bg-[#F3F6FB] px-2.5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15">
                      <input
                        id="plot-input"
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="500"
                        value={plotArea}
                        onChange={(e) => setPlotArea(e.target.value)}
                        placeholder="4"
                        aria-label={locale === "ru" ? "Площадь участка (соток)" : "Yer maydoni (sotix)"}
                        className="w-full min-w-0 bg-transparent text-center text-sm font-extrabold text-slate-900 outline-none"
                      />
                      <span className="px-1 font-extrabold text-blue-600">·</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={totalFloors}
                        onChange={(e) => setTotalFloors(e.target.value)}
                        placeholder="2"
                        aria-label={locale === "ru" ? "Этажей в доме" : "Uy qavatlari"}
                        className="w-full min-w-0 bg-transparent text-center text-sm font-extrabold text-slate-900 outline-none"
                      />
                      <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-extrabold text-slate-500">
                        {locale === "ru" ? "сот/эт" : "sot/qav"}
                      </span>
                    </div>
                  </div>
                )}

                {/* RIGHT SIDE: Umumiy maydon (m²) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="area-input" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                      {locale === "ru" ? "Общая площадь" : "Umumiy maydon"}
                    </label>
                  </div>
                  <div className="flex h-12 items-center justify-between rounded-2xl border border-slate-300/90 bg-[#F3F6FB] px-3 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15">
                    <input
                      id="area-input"
                      type="number"
                      min="10"
                      max="1000"
                      required
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="65"
                      className="w-full min-w-0 bg-transparent text-sm font-extrabold text-slate-900 outline-none"
                    />
                    <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-slate-500">
                      m²
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* STEP 2: Manzil (Viloyat + Tuman, Ko'cha, Mo'ljal, Xarita) */}
          {step === 2 ? (
            <section className="space-y-4 rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:space-y-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="region" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                    {copy.region}
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={selectedRegion}
                    onChange={(event) => {
                      const nextRegion = event.target.value;
                      setSelectedRegion(nextRegion);
                      const firstDistrict = districtOptionsByRegion[nextRegion]?.[0]?.value ?? "";
                      setSelectedDistrict(firstDistrict);
                    }}
                    className="select h-12 text-xs font-bold sm:text-sm"
                  >
                    {regionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="district" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                    {copy.districtCity}
                  </label>
                  <select
                    id="district"
                    name="district"
                    required
                    value={selectedDistrict}
                    onChange={(event) => setSelectedDistrict(event.target.value)}
                    className="select h-12 text-xs font-bold sm:text-sm"
                  >
                    <option value="">{copy.districtSelectPrompt}</option>
                    {districtOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Street / Mahalla / Kvartal Field */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="street" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {locale === "ru" ? "Улица, махалля или квартал" : "Ko'cha, mahalla yoki kvartal"}
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {locale === "ru" ? "Улица" : "Ko'cha nomi"}
                  </span>
                </div>
                <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-slate-300/90 bg-[#F3F6FB] px-3.5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
                    <path d="M12 13v8M12 3v3" />
                  </svg>
                  <input
                    id="street"
                    name="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder={
                      locale === "ru"
                        ? "Например: ул. Катартал, квартал 9"
                        : "Masalan: Qatortol ko'chasi, 9-kvartal"
                    }
                    className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none sm:text-sm"
                  />
                </div>
              </div>

              {/* Landmark & House Number */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="address" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {locale === "ru" ? "Ориентир и номер дома" : "Mo'ljal va uy raqami"}
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {locale === "ru" ? "Для быстрого поиска" : "Tez topish uchun"}
                  </span>
                </div>
                <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-slate-300/90 bg-[#F3F6FB] px-3.5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      locale === "ru"
                        ? "Например: возле метро Чиланзар и банка NBU, дом 14"
                        : "Masalan: NBU bank va Chilonzor metrosi yonida, 14-dom"
                    }
                    className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none sm:text-sm"
                  />
                </div>
              </div>

              {/* Interactive Map Pin */}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                  {copy.mapLocation}
                </label>
                <LocationPicker
                  initialPosition={position}
                  defaultCenter={
                    getDistrictCentroid(selectedRegion, selectedDistrict) ?? FALLBACK_MAP_CENTER
                  }
                  onChange={setPosition}
                  copy={{
                    helper: copy.mapLocationHelper,
                    useMyLocation: copy.useMyLocation,
                    locating: copy.locating,
                    locateError: copy.locateError,
                    notSet: copy.mapLocationNotSet
                  }}
                />
              </div>
            </section>
          ) : null}

          {/* STEP 3: Qulayliklar (Jihozlanishi, Kimlar uchun / Hujjatlar, va Uyda nimalar bor?) */}
          {step === 3 ? (
            <section className="space-y-5 rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:p-6">
              {/* Ta'miri va jihozlanishi */}
              <div>
                <span className="mb-2 block text-xs font-extrabold text-slate-900 sm:text-sm">
                  {locale === "ru" ? "Ремонт и мебель" : "Ta'miri va jihozlanishi"}
                </span>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                  {(["FURNISHED", "PARTIAL", "UNFURNISHED"] as const).map((fs) => {
                    const active = furnishing === fs;
                    return (
                      <button
                        key={fs}
                        type="button"
                        onClick={() => setFurnishing(fs)}
                        className={`rounded-xl py-2.5 text-xs font-extrabold transition ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {furnishingLabels[fs]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uyda nimalar bor? (Property-type-aware amenities with crisp SVG icons) */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {locale === "ru" ? "Что есть в доме?" : "Uyda nimalar bor?"}
                  </span>
                  <span className="text-[11px] font-extrabold text-blue-600">
                    {activeAmenityList.length} {locale === "ru" ? "выбрано" : "ta tanlandi"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {visibleAmenityKeys.map((key) => {
                    const active = amenities.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAmenity(key)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-extrabold transition ${
                          active
                            ? "border-blue-600 bg-[#EFF6FF] text-blue-800 shadow-2xs"
                            : "border-slate-200 bg-[#F3F6FB] text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className={active ? "text-blue-600" : "text-slate-500"}>
                          <AmenityIcon name={key} />
                        </span>
                        <span className="truncate">{AMENITY_LABELS[locale][key]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {/* STEP 4: Rasmlar va Tavsif */}
          {step === 4 ? (
            <section className="space-y-4 rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:space-y-5 sm:p-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {copy.images}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {photos.length} / 10
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                />

                {photos.length < 10 ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                      isDraggingOver
                        ? "border-blue-600 bg-blue-50"
                        : "border-blue-300 bg-[#F3F6FB] hover:border-blue-500 hover:bg-[#EFF6FF]"
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 sm:text-sm">
                      {copy.uploadCta}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {copy.uploadNote}
                    </p>
                  </div>
                ) : null}

                {photos.length > 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                      >
                        <Image
                          src={photo.previewUrl}
                          alt={`${copy.uploadPreviewAlt} ${index + 1}`}
                          fill
                          unoptimized={
                            photo.status === "uploading" || isLocalImageUrl(photo.previewUrl)
                          }
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, 25vw"
                        />
                        {index === 0 ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-xs">
                            {locale === "ru" ? "Главное" : "Asosiy"}
                          </span>
                        ) : null}
                        {photo.status === "uploading" ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/65 text-white">
                            <span className="text-[11px] font-bold">{photo.progress ?? 0}%</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={copy.removeImage}
                            onClick={() => removeImage(photo.id)}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/75 text-white transition hover:bg-rose-600"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {uploadError ? (
                  <p className="mt-2 text-xs font-bold text-rose-600">{uploadError}</p>
                ) : null}
              </div>

              {/* Smart Title */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="title" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {copy.title}
                  </label>
                  <button
                    type="button"
                    onClick={() => setTitle(generateSmartTitle())}
                    className="text-[11px] font-extrabold text-blue-600 hover:underline"
                  >
                    ✨ {locale === "ru" ? "Автозаполнение" : "Avto-sarlavha"}
                  </button>
                </div>
                <input
                  id="title"
                  name="title"
                  required
                  minLength={5}
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={copy.titlePlaceholder}
                  className="input text-xs font-bold sm:text-sm"
                />
              </div>

              {/* Smart Description */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="description" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    {copy.description}
                  </label>
                  <button
                    type="button"
                    onClick={() => setDescription(generateSmartDescription())}
                    className="text-[11px] font-extrabold text-blue-600 hover:underline"
                  >
                    ✨ {locale === "ru" ? "Сгенерировать текст" : "Avto-tavsif"}
                  </button>
                </div>
                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={20}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={copy.descriptionPlaceholder}
                  className="textarea min-h-[115px] text-xs font-medium leading-relaxed sm:text-sm"
                />
              </div>
            </section>
          ) : null}

          {/* STEP 5: Narx, To'lov ichidagi shartlar, Aloqa (Ism, Familiya, Tel, Gmail) va Yakuniy ko'rib chiqish */}
          {step === 5 ? (
            <div className="space-y-4">
              {/* 5A. Price, Currency, "Kami bor" & What is inside the cost of payment */}
              <section className="space-y-4 rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:space-y-5 sm:p-6">
                <div className="grid grid-cols-[1fr_115px] gap-3">
                  <div>
                    <label htmlFor="price" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                      {listingType === "rent"
                        ? selectedRentType === "daily"
                          ? locale === "ru"
                            ? "Суточная стоимость аренды"
                            : "Kunlik ijara narxi"
                          : copy.rentPrice
                        : copy.salePrice}
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      required
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      placeholder={listingType === "sale" ? "55000" : "400"}
                      className="input text-base font-extrabold text-blue-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="currency" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                      {copy.currency}
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as CurrencyValue)}
                      className="select font-extrabold"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c === "USD" ? "$ USD" : "UZS"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* "Kami bor" Negotiable Toggle */}
                <button
                  type="button"
                  onClick={() => setNegotiable((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-[#F3F6FB] p-3.5 text-left transition hover:border-blue-300"
                >
                  <div>
                    <span className="block text-xs font-extrabold text-slate-900 sm:text-sm">
                      {locale === "ru" ? "Торг уместен («Ками бор»)" : "«Kami bor» (Narxi kelishiladi)"}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                      {locale === "ru"
                        ? "Покупатели видят, что можно договориться"
                        : "Mijozlar bilan narx ustida kelishish mumkin"}
                    </span>
                  </div>
                  <span
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                      negotiable ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                        negotiable ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>

                {/* What is inside the cost of payment (Narx ichiga nimalar kiradi va to'lov shartlari) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                      {listingType === "sale"
                        ? locale === "ru"
                          ? "Что входит в стоимость и условия оплаты"
                          : "Sotuv narxi ichida nimalar bor va to'lov shartlari"
                        : locale === "ru"
                          ? "Что входит в оплату аренды?"
                          : "To'lov narxi ichiga nimalar kiradi?"}
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600">
                      {activeIncludedList.length} {locale === "ru" ? "выбрано" : "ta tanlandi"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {activeIncludedKeys.map((key) => {
                      const active = includedInPrice.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleIncludedInPrice(key)}
                          className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-extrabold transition ${
                            active
                              ? "border-blue-600 bg-[#EFF6FF] text-blue-800 shadow-2xs"
                              : "border-slate-200 bg-[#F3F6FB] text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              active
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className="leading-snug">{INCLUDED_IN_PRICE_LABELS[locale][key]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 5B. Submitter Contact Details: Ism, Familiya, Telefon raqami, Gmail (optional) */}
              <section className="space-y-4 rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:space-y-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-extrabold text-slate-900 sm:text-base">
                    {locale === "ru" ? "Контактные данные автора" : "Murojaat uchun aloqa ma'lumotlari"}
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600">
                    {locale === "ru" ? "Шаг 5" : "Shaxsiy ma'lumot"}
                  </span>
                </div>

                {/* First Name & Last Name in one row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="contact-first-name" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                      {locale === "ru" ? "Имя *" : "Ismingiz *"}
                    </label>
                    <input
                      id="contact-first-name"
                      type="text"
                      required
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      placeholder={locale === "ru" ? "Мухаммадали" : "Muhammadali"}
                      className="input text-xs font-bold sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-last-name" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                      {locale === "ru" ? "Фамилия *" : "Familiyangiz *"}
                    </label>
                    <input
                      id="contact-last-name"
                      type="text"
                      required
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      placeholder={locale === "ru" ? "Абдуллаев" : "Abdullayev"}
                      className="input text-xs font-bold sm:text-sm"
                    />
                  </div>
                </div>

                {/* Phone Number & Optional Gmail */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-extrabold text-slate-900 sm:text-sm">
                      {copy.phone} *
                    </label>
                    <div className="flex h-12 items-stretch overflow-hidden rounded-2xl border border-slate-300/90 bg-[#F3F6FB] transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15">
                      <span className="flex items-center border-r border-slate-200 bg-slate-100 px-3.5 text-sm font-extrabold text-slate-700 select-none">
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                        placeholder="901234567"
                        className="w-full flex-1 bg-transparent px-3.5 text-sm font-extrabold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="contact-email" className="text-xs font-extrabold text-slate-900 sm:text-sm">
                        {locale === "ru" ? "Gmail / Эл. почта" : "Gmail / Elektron pochta"}
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {locale === "ru" ? "Необязательно" : "Ixtiyoriy"}
                      </span>
                    </div>
                    <input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="input h-12 text-xs font-bold sm:text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* 5C. FINAL REVIEW OF THE LISTING (Yakuniy ko'rib chiqish) */}
              <section className="overflow-hidden rounded-[24px] border-2 border-blue-200 bg-white shadow-[0_10px_28px_-8px_rgba(37,99,235,0.14)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE]/60 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <h3 className="font-display text-xs font-extrabold text-slate-900 sm:text-sm">
                      {locale === "ru"
                        ? "Итоговая проверка вашего объявления"
                        : "E'loningizning yakuniy ko'rinishi (Tekshirib oling)"}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {([1, 2, 3, 4] as const).map((sId) => (
                      <button
                        key={sId}
                        type="button"
                        onClick={() => goToStep(sId)}
                        className="rounded-lg border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-extrabold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                      >
                        ✎ {sId}-{locale === "ru" ? "шаг" : "qadam"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  {/* Top Row: Cover Photo + Main Headline & Price */}
                  <div className="grid gap-3.5 sm:grid-cols-[160px_1fr]">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {previewCoverUrl ? (
                        <Image
                          src={previewCoverUrl}
                          alt={previewTitle}
                          fill
                          unoptimized={isLocalImageUrl(previewCoverUrl)}
                          className="object-cover"
                          sizes="180px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                          {locale === "ru" ? "Нет фото" : "Rasm yo'q"}
                        </div>
                      )}
                      {/* Only heart button on photo */}
                      <span
                        aria-hidden="true"
                        className="badge-blur absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700 shadow-xs"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.1">
                          <path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7 4.7 4.7 0 0 1 6.8 0L12 7.2l.4-.5a4.7 4.7 0 0 1 6.8 0 4.9 4.9 0 0 1 0 7Z" />
                        </svg>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                          {listingType === "sale"
                            ? locale === "ru"
                              ? "Продажа"
                              : "Sotuv"
                            : selectedRentType === "daily"
                              ? locale === "ru"
                                ? "Посуточно"
                                : "Kunlik ijara"
                              : locale === "ru"
                                ? "Долгосрочная аренда"
                                : "Oylik ijara"}
                        </span>
                        <span className="rounded-md border border-slate-200 bg-[#F3F6FB] px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                          {propertyType === "house"
                            ? locale === "ru"
                              ? "Дом / Участок"
                              : "Hovli / Uy"
                            : propertyTypeLabels[propertyType]}
                        </span>
                        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                          {furnishingLabels[furnishing]}
                        </span>
                        {negotiable ? (
                          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                            {locale === "ru" ? "Торг уместен" : "Kami bor"}
                          </span>
                        ) : null}
                      </div>

                      <p className="font-display text-xl font-extrabold text-blue-600">
                        {previewPriceFormatted}
                      </p>

                      <p className="text-sm font-extrabold text-slate-900">{previewTitle}</p>
                      <p className="text-xs font-semibold text-slate-500">📍 {previewLocation}</p>
                    </div>
                  </div>

                  {/* Specs Summary Strip */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-3 text-center">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 sm:text-sm">
                        {propertyType === "studio" ? "1 (Studiya)" : `${rooms || 2} ta`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500">{copy.rooms}</p>
                    </div>
                    <div className="border-x border-slate-200">
                      <p className="text-xs font-extrabold text-slate-900 sm:text-sm">{area || 65} m²</p>
                      <p className="text-[10px] font-bold text-slate-500">{copy.area}</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 sm:text-sm">{previewFloorSpec}</p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {propertyType === "house"
                          ? locale === "ru"
                            ? "Участок / Этажи"
                            : "Sotix / Qavat"
                          : locale === "ru"
                            ? "Этажность"
                            : "Qavati"}
                      </p>
                    </div>
                  </div>

                  {/* What's Included in Price + Amenities Summary */}
                  {activeIncludedList.length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        {locale === "ru" ? "Условия оплаты:" : "Narx va to'lov shartlari:"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeIncludedList.map((inc) => (
                          <span
                            key={inc}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800"
                          >
                            <span>✓</span>
                            <span>
                              {INCLUDED_IN_PRICE_LABELS[locale][inc as IncludedInPriceKey]}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {activeAmenityList.length > 0 || activePrefList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                      {activeAmenityList.map((a) => (
                        <span
                          key={a}
                          className="rounded-lg border border-blue-200 bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-blue-800"
                        >
                          {AMENITY_LABELS[locale][a as AmenityKey]}
                        </span>
                      ))}
                      {activePrefList.map((tp) => (
                        <span
                          key={tp}
                          className="rounded-lg border border-slate-200 bg-[#F3F6FB] px-2 py-0.5 text-[11px] font-bold text-slate-700"
                        >
                          {TENANT_PREFERENCE_LABELS[locale][tp as TenantPreferenceKey]}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Submitter Contact Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#0F172A] px-4 py-3 text-xs text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-display text-xs font-extrabold">
                        {(contactFirstName[0] || "U").toUpperCase()}
                        {(contactLastName[0] || "Y").toUpperCase()}
                      </span>
                      <div>
                        <p className="font-extrabold">
                          {[contactFirstName.trim(), contactLastName.trim()].filter(Boolean).join(" ") ||
                            (locale === "ru" ? "Имя не указано" : "Ism Familiya kiritilmagan")}
                        </p>
                        {contactEmail.trim() ? (
                          <p className="text-[11px] text-slate-300">{contactEmail.trim()}</p>
                        ) : null}
                      </div>
                    </div>
                    <span className="rounded-xl bg-white/10 px-3 py-1.5 font-extrabold tabular-nums text-blue-300">
                      +998 {phone || "•• ••• •• ••"}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {/* Step Navigation Footer Buttons (with Bottom Send Listing Button on Step 5) */}
          <div className="flex items-center gap-2.5 rounded-[22px] border border-slate-200/90 bg-white p-3 shadow-[0_6px_20px_-6px_rgba(15,23,42,0.06)]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => goToStep((step - 1) as 1 | 2 | 3 | 4 | 5)}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-[#F3F6FB] px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 sm:px-5 sm:text-sm"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>{locale === "ru" ? "Назад" : "Orqaga"}</span>
              </button>
            ) : null}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-primary h-12 flex-1 gap-2 rounded-xl text-xs font-extrabold sm:text-sm"
              >
                <span>{steps.find((s) => s.id === step)?.nextTitle}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || hasUploadingPhoto}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 text-xs font-extrabold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span>
                  {hasUploadingPhoto
                    ? copy.uploading
                    : isSubmitting
                      ? mode === "edit"
                        ? copy.updating ?? copy.submitting
                        : copy.submitting
                      : mode === "edit"
                        ? copy.updateSubmit ?? copy.submit
                        : locale === "ru"
                          ? "Отправить объявление"
                          : "E'lonni yuborish va joylash"}
                </span>
              </button>
            )}
          </div>
        </form>

        {/* Right Column (Desktop Split-View): Live Updating Card Preview */}
        <aside className="sticky top-24 hidden space-y-3 lg:block">
          <div className="rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                ● {locale === "ru" ? "Предпросмотр карточки" : "Jonli ko'rinish (Preview)"}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {locale === "ru" ? "На сайте" : "Saytda ko'rinishi"}
              </span>
            </div>

            {/* Live Preview Card matching ListingCard */}
            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-xs">
              {/* Photo: ONLY the like/heart button on the photo */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                {previewCoverUrl ? (
                  <Image
                    src={previewCoverUrl}
                    alt={previewTitle}
                    fill
                    unoptimized={isLocalImageUrl(previewCoverUrl)}
                    className="object-cover"
                    sizes="340px"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-blue-50 to-slate-200 text-slate-400">
                    <PropertyTypeIcon type={propertyType} />
                    <span className="text-[11px] font-bold">
                      {locale === "ru" ? "Фото появится здесь" : "Rasm shu yerda ko'rinadi"}
                    </span>
                  </div>
                )}

                <span
                  aria-hidden="true"
                  className="badge-blur absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-700 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.1">
                    <path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7 4.7 4.7 0 0 1 6.8 0L12 7.2l.4-.5a4.7 4.7 0 0 1 6.8 0 4.9 4.9 0 0 1 0 7Z" />
                  </svg>
                </span>
              </div>

              <div className="space-y-2 p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-lg font-extrabold leading-none text-blue-600">
                    {previewPriceFormatted}
                  </p>
                  {negotiable ? (
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                      {locale === "ru" ? "Торг" : "Kami bor"}
                    </span>
                  ) : null}
                </div>

                <p className="text-xs font-bold text-slate-700">
                  {propertyType === "studio" ? "1" : rooms || 2} {copy.rooms.toLowerCase()} ·{" "}
                  {area || 65} m² · {previewFloorSpec}
                </p>

                <p className="line-clamp-2 text-xs font-extrabold leading-snug text-slate-900">
                  {previewTitle}
                </p>

                <p className="truncate text-[11px] font-semibold text-slate-500">
                  {previewLocation}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="rounded-md border border-slate-200 bg-[#F3F6FB] px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {propertyType === "house"
                      ? locale === "ru"
                        ? "Дом / Участок"
                        : "Hovli / Uy"
                      : propertyTypeLabels[propertyType]}
                  </span>
                  <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {furnishingLabels[furnishing]}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-[#F3F6FB] p-3 text-[11px] leading-relaxed font-medium text-slate-600">
              <strong className="text-slate-900">
                {locale === "ru" ? "Умный помощник:" : "Smart yordamchi:"}
              </strong>{" "}
              {locale === "ru"
                ? "На 5-м шаге вы увидите полную итоговую карточку объявления перед отправкой."
                : "5-qadamda e'lonni yuborishdan oldin barcha kiritgan ma'lumotlaringizni yakuniy kartochkada tekshirib olasiz."}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
