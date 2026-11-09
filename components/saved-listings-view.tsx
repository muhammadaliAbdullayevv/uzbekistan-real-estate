"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type SavedListingItem = {
  id: string;
  title: string;
  priceFormatted: string;
  priceEquivFormatted: string;
  priceRaw: number;
  currency: string;
  listingType: "rent" | "sale";
  rentType: "monthly" | "daily" | null;
  region: string;
  district: string;
  rooms: number;
  area: number;
  floorLabel: string | null;
  phone: string;
  contactHref: string;
  telegramHref: string | null;
  images: { id: string; url: string }[];
  createdAt: string;
};

export type SavedPageCopy = {
  pill: string;
  title: string;
  intro: string;
  browseMore: string;
  emptyTitle: string;
  emptyDescription: string;
  allTab: string;
  rentTab: string;
  saleTab: string;
  clearAll: string;
  clearConfirm: string;
  call: string;
  callShort: string;
  popularDistricts: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  details: string;
};

type SavedListingsViewProps = {
  initialListings: SavedListingItem[];
  locale: "uz" | "ru";
  copy: SavedPageCopy;
};

export function SavedListingsView({ initialListings, locale, copy }: SavedListingsViewProps) {
  const isRu = locale === "ru";

  const [listings, setListings] = useState<SavedListingItem[]>(initialListings);
  const [activeTab, setActiveTab] = useState<"all" | "rent" | "sale">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Counts
  const allCount = listings.length;
  const rentCount = listings.filter((l) => l.listingType === "rent").length;
  const saleCount = listings.filter((l) => l.listingType === "sale").length;

  // Filter
  const filteredListings = listings.filter((listing) => {
    if (activeTab === "rent") return listing.listingType === "rent";
    if (activeTab === "sale") return listing.listingType === "sale";
    return true;
  });

  // Sort
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price_asc") return a.priceRaw - b.priceRaw;
    if (sortBy === "price_desc") return b.priceRaw - a.priceRaw;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handle Remove single
  async function handleRemove(listingId: string) {
    setListings((prev) => prev.filter((item) => item.id !== listingId));

    try {
      await fetch(`/api/favorites/${listingId}`, {
        method: "DELETE"
      });
    } catch {
      setListings(initialListings);
    }
  }

  // Handle Clear All
  async function handleClearAll() {
    setIsClearing(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE"
      });
      if (res.ok) {
        setListings([]);
        setShowClearConfirm(false);
      }
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                <span>❤️</span>
                <span>{copy.pill}</span>
                <span className="rounded-md bg-rose-200/70 px-1.5 py-0.2 text-[11px] font-black">
                  {allCount}
                </span>
              </span>
            </div>

            <h1 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {copy.title}
            </h1>
            <p className="max-w-xl text-xs sm:text-sm font-medium text-slate-500">
              {copy.intro}
            </p>
          </div>

          {/* Quick Actions (Clear All & Sort) */}
          {allCount > 0 ? (
            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <select
                aria-label="Sort listings"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs outline-hidden hover:bg-slate-100 transition cursor-pointer"
              >
                <option value="newest">{copy.sortNewest}</option>
                <option value="price_asc">{copy.sortPriceAsc}</option>
                <option value="price_desc">{copy.sortPriceDesc}</option>
              </select>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100 active:scale-95"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>{copy.clearAll}</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* Category Tabs (Barchasi, Ijara, Sotuv) */}
        {allCount > 0 ? (
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {copy.allTab} ({allCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rent")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeTab === "rent"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {copy.rentTab} ({rentCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sale")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeTab === "sale"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {copy.saleTab} ({saleCount})
            </button>
          </div>
        ) : null}
      </section>

      {/* 2. Main Content Area */}
      {allCount === 0 ? (
        /* Friendly Empty State */
        <div className="rounded-[36px] border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-xs space-y-6 max-w-lg mx-auto my-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-tr from-rose-100 via-rose-50 to-blue-100 text-4xl shadow-md">
            💖
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
              0 {isRu ? "сохранено" : "ta saqlangan"}
            </span>
            <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">
              {copy.emptyTitle}
            </h2>
            <p className="mx-auto max-w-xs text-xs sm:text-sm font-medium leading-relaxed text-slate-500">
              {copy.emptyDescription}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-98"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>{copy.browseMore}</span>
            </Link>
          </div>

          {/* Quick Location Shortcuts */}
          <div className="border-t border-slate-100 pt-6 space-y-2.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {copy.popularDistricts}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { name: "Chilonzor", query: "/?region=Toshkent&district=Chilonzor" },
                { name: "Mirobod", query: "/?region=Toshkent&district=Mirobod" },
                { name: "Yakkasaroy", query: "/?region=Toshkent&district=Yakkasaroy" },
                { name: "Yunusobod", query: "/?region=Toshkent&district=Yunusobod" }
              ].map((loc) => (
                <Link
                  key={loc.name}
                  href={loc.query}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
                >
                  📍 {loc.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : sortedListings.length === 0 ? (
        /* Empty Tab Filter */
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">
            {isRu ? "В этой категории нет сохранённых объявлений" : "Bu toifada saqlangan e'lonlar topilmadi"}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className="text-xs font-black text-blue-600 hover:underline"
          >
            {isRu ? "Показать все объявления" : "Barcha saqlanganlarni ko'rish"}
          </button>
        </div>
      ) : (
        <div>
          {/* ======================================================== */}
          {/* MOBILE VIEW: SMART HORIZONTAL COMPARISON CARDS (< md)   */}
          {/* ======================================================== */}
          <div className="space-y-3 md:hidden">
            {sortedListings.map((listing) => (
              <MobileSavedCard
                key={listing.id}
                listing={listing}
                locale={locale}
                copy={copy}
                onRemove={() => handleRemove(listing.id)}
              />
            ))}
          </div>

          {/* ======================================================== */}
          {/* DESKTOP VIEW: 3-COLUMN RESPONSIVE GRID (>= md)          */}
          {/* ======================================================== */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedListings.map((listing) => (
              <DesktopSavedCard
                key={listing.id}
                listing={listing}
                locale={locale}
                onRemove={() => handleRemove(listing.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-slate-900">
                {copy.clearAll}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {copy.clearConfirm}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {isRu ? "Отмена" : "Bekor qilish"}
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearAll}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-black text-white hover:bg-rose-500 transition disabled:opacity-50"
              >
                {isClearing ? "..." : copy.clearAll}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MOBILE SMART COMPARISON CARD
// -----------------------------------------------------------------------------
function MobileSavedCard({
  listing,
  locale,
  copy,
  onRemove
}: {
  listing: SavedListingItem;
  locale: "uz" | "ru";
  copy: SavedPageCopy;
  onRemove: () => void;
}) {
  const isRu = locale === "ru";
  const mainPhoto = listing.images[0]?.url || "/placeholder-home.jpg";

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs space-y-2.5 transition">
      {/* Upper Content: Photo on Left, Details on Right */}
      <div className="flex gap-3">
        {/* Thumbnail */}
        <Link
          href={`/listings/${listing.id}`}
          className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 block"
        >
          <Image
            src={mainPhoto}
            alt={listing.title}
            fill
            sizes="120px"
            className="object-cover"
          />
          {listing.images.length > 1 ? (
            <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur-xs">
              1/{listing.images.length}
            </span>
          ) : null}
          <span
            className={`absolute top-1 left-1 rounded-md px-1.5 py-0.2 text-[9px] font-black backdrop-blur-xs ${
              listing.listingType === "rent"
                ? "bg-blue-600/90 text-white"
                : "bg-emerald-600/90 text-white"
            }`}
          >
            {listing.listingType === "rent" ? (isRu ? "Аренда" : "Ijara") : (isRu ? "Продажа" : "Sotuv")}
          </span>
        </Link>

        {/* Info Column */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            {/* Price & Remove Heart Button */}
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="font-display text-base font-black leading-tight text-blue-600">
                  {listing.priceFormatted}
                </p>
                <span className="text-[10px] font-bold text-slate-400 block leading-tight truncate">
                  {listing.priceEquivFormatted}
                </span>
              </div>

              {/* Un-favorite Heart Button */}
              <button
                type="button"
                onClick={onRemove}
                aria-label="Remove from saved"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-2xs transition hover:bg-rose-100 active:scale-90"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-rose-500" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <Link href={`/listings/${listing.id}`}>
              <h3 className="font-extrabold text-xs text-slate-900 mt-1 truncate hover:text-blue-600">
                {listing.title}
              </h3>
            </Link>

            {/* Location */}
            <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
              📍 {listing.district ? `${listing.district}, ` : ""}{listing.region}
            </p>
          </div>

          {/* Specs pills */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold text-slate-600 pt-1">
            <span className="rounded bg-slate-100 px-1.5 py-0.5">
              {listing.rooms} {isRu ? "комн." : "xona"}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5">
              {listing.area} m²
            </span>
            {listing.floorLabel ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5">
                {listing.floorLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Direct Action Row: Call & Telegram */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
        <a
          href={listing.contactHref}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 py-2 px-3 text-xs font-black text-white shadow-xs transition hover:bg-blue-500 active:scale-98"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{copy.callShort}</span>
        </a>

        {listing.telegramHref ? (
          <a
            href={listing.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-[#EFF6FF] text-blue-600 shadow-2xs transition hover:bg-blue-100 active:scale-95"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </a>
        ) : null}

        <Link
          href={`/listings/${listing.id}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
          aria-label="View listing details"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

// -----------------------------------------------------------------------------
// DESKTOP SAVED CARD
// -----------------------------------------------------------------------------
function DesktopSavedCard({
  listing,
  locale,
  onRemove
}: {
  listing: SavedListingItem;
  locale: "uz" | "ru";
  onRemove: () => void;
}) {
  const isRu = locale === "ru";
  const mainPhoto = listing.images[0]?.url || "/placeholder-home.jpg";

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300">
      {/* Photo with Overlays */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Link href={`/listings/${listing.id}`} className="absolute inset-0 block">
          <Image
            src={mainPhoto}
            alt={listing.title}
            fill
            sizes="(max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-black shadow-xs pointer-events-auto backdrop-blur-xs ${
              listing.listingType === "rent"
                ? "bg-blue-600/95 text-white"
                : "bg-emerald-600/95 text-white"
            }`}
          >
            {listing.listingType === "rent" ? (isRu ? "Аренда" : "Ijara") : (isRu ? "Продажа" : "Sotuv")}
          </span>

          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove from saved"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-rose-500" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>

        {/* Photo Count */}
        {listing.images.length > 1 ? (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
            📷 {listing.images.length}
          </span>
        ) : null}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          {/* Price */}
          <div className="flex items-baseline justify-between gap-1">
            <p className="font-display text-xl font-black text-blue-600 tracking-tight">
              {listing.priceFormatted}
            </p>
            <span className="text-[11px] font-bold text-slate-400">
              {listing.priceEquivFormatted}
            </span>
          </div>

          {/* Title */}
          <Link href={`/listings/${listing.id}`}>
            <h3 className="font-display text-sm font-extrabold text-slate-900 truncate hover:text-blue-600">
              {listing.title}
            </h3>
          </Link>

          {/* Location */}
          <p className="text-xs text-slate-500 font-semibold truncate">
            📍 {listing.district ? `${listing.district}, ` : ""}{listing.region}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-1">
            <span className="rounded-lg bg-slate-100 px-2 py-0.5">
              {listing.rooms} {isRu ? "комн." : "xona"}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-0.5">
              {listing.area} m²
            </span>
            {listing.floorLabel ? (
              <span className="rounded-lg bg-slate-100 px-2 py-0.5">
                {listing.floorLabel}
              </span>
            ) : null}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <a
            href={listing.contactHref}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-3 text-xs font-black text-white shadow-xs transition hover:bg-blue-500 active:scale-98"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{listing.phone}</span>
          </a>

          {listing.telegramHref ? (
            <a
              href={listing.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-[#EFF6FF] text-blue-600 transition hover:bg-blue-100 active:scale-95"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </a>
          ) : null}

          <Link
            href={`/listings/${listing.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:scale-95"
            aria-label="View listing details"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
