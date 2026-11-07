"use client";

import Link from "next/link";
import { useState } from "react";

import { LocationSelect } from "@/components/location-select";
import { NearMeButton } from "@/components/near-me-button";
import {
  CURRENCIES,
  FURNISHING_STATUSES,
  PROPERTY_TYPES,
  RENT_TYPES,
  type FurnishingStatusValue,
  type PropertyTypeValue,
  type RentTypeValue
} from "@/lib/constants";
import type { UzbekistanRegion } from "@/lib/locations";

type SearchFilterModalProps = {
  locale: "uz" | "ru";
  activeCount: number;
  filterLabel: string;
  regionOptions: Array<{ value: UzbekistanRegion; label: string }>;
  initialValues: {
    listingType: string;
    region: string;
    district: string;
    propertyType: string;
    rooms: string;
    minPrice: string;
    maxPrice: string;
    currency: string;
    rentType: string;
    furnishing: string;
    sort: string;
    verifiedOnly: boolean;
  };
  copy: {
    listingTypeLabel: string;
    listingTypeOptions: Array<{ value: string; label: string }>;
    region: string;
    allRegions: string;
    districtCity: string;
    districtCityPlaceholder: string;
    propertyType: string;
    propertyTypeLabels: Record<PropertyTypeValue, string>;
    rooms: string;
    anyOption: string;
    roomsPlus: string;
    priceRange: string;
    priceMin: string;
    priceMax: string;
    rentDuration: string;
    rentTypeLabels: Record<RentTypeValue, string>;
    furnishingLabel: string;
    furnishingLabels: Record<FurnishingStatusValue, string>;
    sort: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    nearMe: string;
    locating: string;
    nearMeActive: string;
    nearMeError: string;
    verifiedOnly: string;
    resetFilters: string;
    applyFilters: string;
  };
};

function PropertyChipIcon({ type }: { type: PropertyTypeValue | "" }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  switch (type) {
    case "flat":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M10 6h4M10 10h4M10 14h4" />
        </svg>
      );
    case "house":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        </svg>
      );
    case "room":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20" />
        </svg>
      );
    case "studio":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 12h18" />
        </svg>
      );
    default:
      return null;
  }
}

export function SearchFilterModal({
  locale,
  activeCount,
  filterLabel,
  regionOptions,
  initialValues,
  copy
}: SearchFilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [listingType, setListingType] = useState(initialValues.listingType);
  const [propertyType, setPropertyType] = useState(initialValues.propertyType);
  const [rooms, setRooms] = useState(initialValues.rooms);
  const [rentType, setRentType] = useState(
    initialValues.listingType === "sale" ? "" : initialValues.rentType
  );
  const [furnishing, setFurnishing] = useState(initialValues.furnishing);
  const [currency, setCurrency] = useState(initialValues.currency);
  const [sort, setSort] = useState(initialValues.sort || "newest");
  const [verifiedOnly, setVerifiedOnly] = useState(initialValues.verifiedOnly);

  const roomOptions = [
    { value: "", label: copy.anyOption },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: copy.roomsPlus }
  ];

  const propertyOptions: Array<{ value: PropertyTypeValue | ""; label: string }> = [
    { value: "", label: copy.anyOption },
    ...PROPERTY_TYPES.map((type) => ({
      value: type,
      label:
        type === "house"
          ? locale === "ru"
            ? "Дом / Участок"
            : "Hovli / Uy"
          : copy.propertyTypeLabels[type]
    }))
  ];

  const furnishingOptions: Array<{ value: FurnishingStatusValue | ""; label: string }> = [
    { value: "", label: copy.anyOption },
    ...FURNISHING_STATUSES.map((fs) => ({
      value: fs,
      label: copy.furnishingLabels[fs]
    }))
  ];

  const rentDurationOptions: Array<{ value: RentTypeValue | ""; label: string }> = [
    { value: "", label: copy.anyOption },
    ...RENT_TYPES.map((rt) => ({
      value: rt,
      label: copy.rentTypeLabels[rt]
    }))
  ];

  return (
    <>
      {/* Hidden form inputs so the parent GET form always submits current state even when modal is closed */}
      {listingType ? <input type="hidden" name="listingType" value={listingType} /> : null}
      {propertyType ? <input type="hidden" name="propertyType" value={propertyType} /> : null}
      {rooms ? <input type="hidden" name="rooms" value={rooms} /> : null}
      {listingType !== "sale" && rentType ? (
        <input type="hidden" name="rentType" value={rentType} />
      ) : null}
      {furnishing ? <input type="hidden" name="furnishing" value={furnishing} /> : null}
      {currency ? <input type="hidden" name="currency" value={currency} /> : null}
      {sort && sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
      {verifiedOnly ? <input type="hidden" name="verifiedOnly" value="1" /> : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={filterLabel}
        title={filterLabel}
        className={`relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition sm:h-11 sm:px-3.5 ${
          isOpen || activeCount > 0
            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "border-blue-200 bg-[#EFF6FF] text-blue-600 hover:border-blue-300 hover:bg-blue-100"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="16" y2="18" />
          <circle cx="6" cy="6" r="2" />
          <circle cx="14" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
        <span className="hidden sm:inline">{filterLabel}</span>
        {activeCount > 0 ? (
          <span
            className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
              isOpen || activeCount > 0
                ? "bg-white text-blue-700"
                : "bg-blue-600 text-white"
            }`}
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="16" y2="18" />
                    <circle cx="6" cy="6" r="2" />
                    <circle cx="14" cy="12" r="2" />
                    <circle cx="18" cy="18" r="2" />
                  </svg>
                </span>
                <h2 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">
                  {filterLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-[#F3F6FB] text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="Close"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Deal Type (E'lon turi) — Segmented Buttons */}
              <div>
                <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {copy.listingTypeLabel}
                </p>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                  {copy.listingTypeOptions.map((option) => {
                    const active = listingType === option.value;
                    return (
                      <button
                        key={option.value || "all"}
                        type="button"
                        onClick={() => {
                          setListingType(option.value);
                          if (option.value === "sale") {
                            setRentType("");
                          }
                        }}
                        className={`flex h-9 items-center justify-center rounded-xl px-2 text-center text-xs font-extrabold transition ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Rent Duration (Ijara muddati) — ONLY shown when listingType !== "sale" */}
              {listingType !== "sale" ? (
                <div>
                  <p className="mb-1.5 text-xs font-extrabold text-slate-700">
                    {copy.rentDuration}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                    {rentDurationOptions.map((opt) => {
                      const active = rentType === opt.value;
                      return (
                        <button
                          key={opt.value || "any"}
                          type="button"
                          onClick={() => setRentType(opt.value)}
                          className={`flex h-9 items-center justify-center rounded-xl px-2 text-xs font-extrabold transition ${
                            active
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* 3. Property Type (Uy turi) — Visible On-Screen Pill Buttons (Not hidden dropdown!) */}
              <div>
                <p className="mb-1.5 text-xs font-extrabold text-slate-700">
                  {copy.propertyType}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {propertyOptions.map((opt) => {
                    const active = propertyType === opt.value;
                    return (
                      <button
                        key={opt.value || "any"}
                        type="button"
                        onClick={() => {
                          setPropertyType(opt.value);
                          if (opt.value === "studio") {
                            setRooms("1");
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                            : "border-slate-200 bg-[#F3F6FB] text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        <PropertyChipIcon type={opt.value} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Rooms (Xonalar soni) — Visible On-Screen Buttons */}
              {propertyType !== "studio" ? (
                <div>
                  <p className="mb-1.5 text-xs font-extrabold text-slate-700">
                    {copy.rooms}
                  </p>
                  <div className="grid grid-cols-6 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                    {roomOptions.map((room) => {
                      const active = rooms === room.value;
                      return (
                        <button
                          key={room.value || "any"}
                          type="button"
                          onClick={() => setRooms(room.value)}
                          className={`flex h-9 items-center justify-center rounded-xl text-xs font-extrabold transition ${
                            active
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {room.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* 5. Furnishing (Jihozlanganlik) — Visible On-Screen Buttons (Not hidden dropdown!) */}
              <div>
                <p className="mb-1.5 text-xs font-extrabold text-slate-700">
                  {copy.furnishingLabel}
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {furnishingOptions.map((opt) => {
                    const active = furnishing === opt.value;
                    return (
                      <button
                        key={opt.value || "any"}
                        type="button"
                        onClick={() => setFurnishing(opt.value)}
                        className={`flex h-9 items-center justify-center rounded-xl border px-2.5 text-xs font-extrabold transition ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                            : "border-slate-200 bg-[#F3F6FB] text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Region & District */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="region" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                    {copy.region}
                  </label>
                  <LocationSelect
                    id="region"
                    name="region"
                    defaultValue={initialValues.region}
                    options={regionOptions}
                    emptyLabel={copy.allRegions}
                    className="h-11 rounded-xl text-xs font-semibold sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="district" className="mb-1.5 block text-xs font-extrabold text-slate-700">
                    {copy.districtCity}
                  </label>
                  <input
                    id="district"
                    name="district"
                    defaultValue={initialValues.district}
                    placeholder={copy.districtCityPlaceholder}
                    className="input h-11 rounded-xl text-xs font-semibold sm:text-sm"
                  />
                </div>
              </div>

              {/* 7. Price Range & Currency */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-extrabold text-slate-700">{copy.priceRange}</p>
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-[#F3F6FB] p-0.5">
                    {([{ value: "", label: "Hammasi" }, ...CURRENCIES.map((c) => ({ value: c, label: c }))]).map(
                      (c) => (
                        <button
                          key={c.value || "all"}
                          type="button"
                          onClick={() => setCurrency(c.value)}
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold transition ${
                            currency === c.value
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {c.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="minPrice"
                    type="number"
                    min="0"
                    defaultValue={initialValues.minPrice}
                    placeholder={copy.priceMin}
                    className="input h-11 rounded-xl text-xs font-semibold sm:text-sm"
                  />
                  <input
                    name="maxPrice"
                    type="number"
                    min="0"
                    defaultValue={initialValues.maxPrice}
                    placeholder={copy.priceMax}
                    className="input h-11 rounded-xl text-xs font-semibold sm:text-sm"
                  />
                </div>
              </div>

              {/* 8. Sort Options — Visible On-Screen Pills */}
              <div>
                <p className="mb-1.5 text-xs font-extrabold text-slate-700">{copy.sort}</p>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-[#F3F6FB] p-1">
                  {[
                    { value: "newest", label: copy.sortNewest },
                    { value: "price_asc", label: copy.sortPriceAsc },
                    { value: "price_desc", label: copy.sortPriceDesc }
                  ].map((s) => {
                    const active = sort === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSort(s.value)}
                        className={`flex h-9 items-center justify-center rounded-xl px-2 text-[11px] font-extrabold transition sm:text-xs ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 9. GPS Near Me & Verified Owner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <NearMeButton
                  copy={{
                    nearMe: copy.nearMe,
                    locating: copy.locating,
                    nearMeActive: copy.nearMeActive,
                    nearMeError: copy.nearMeError
                  }}
                />

                <button
                  type="button"
                  onClick={() => setVerifiedOnly((prev) => !prev)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
                    verifiedOnly
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-[#F3F6FB] text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>✓</span>
                  <span>{copy.verifiedOnly}</span>
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-2.5 border-t border-slate-200 pt-4">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-[#F3F6FB] px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 sm:text-sm"
                >
                  {copy.resetFilters}
                </Link>
                <button
                  type="submit"
                  className="btn-primary h-11 flex-1 rounded-xl text-xs font-extrabold sm:text-sm"
                >
                  {copy.applyFilters}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
