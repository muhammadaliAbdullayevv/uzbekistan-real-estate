"use client";

import { useEffect, useRef, useState } from "react";
import { PropertyImage } from "@/components/property-image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type ListingGalleryProps = {
  images: string[];
  title: string;
  locale?: "uz" | "ru";
  topActions?: React.ReactNode;
  floatingActions?: React.ReactNode;
  badges?: React.ReactNode;
};

export function ListingGallery({
  images,
  title,
  locale = "uz",
  topActions,
  floatingActions,
  badges
}: ListingGalleryProps) {
  const gallery = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, gallery.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActiveIndex(clamped);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex((current) => (current === index ? current : index));
  }

  function openLightbox(index = 0) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function nextLightbox() {
    setLightboxIndex((prev) => (prev + 1) % gallery.length);
  }

  function prevLightbox() {
    setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, gallery.length]);

  const allPhotosLabel =
    locale === "ru"
      ? `Все ${gallery.length} фото`
      : `Barcha ${gallery.length} ta rasm`;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP AIRBNB-STYLE PHOTO MOSAIC (Hidden on mobile)       */}
      {/* ============================================================== */}
      <div className="hidden lg:block">
        {gallery.length >= 3 ? (
          <div className="relative grid h-[420px] grid-cols-3 gap-3 overflow-hidden rounded-[28px] border border-slate-200/90 bg-slate-900 shadow-md">
            {/* Big Hero Image (2 columns wide) */}
            <div
              onClick={() => openLightbox(0)}
              className="group relative col-span-2 h-full cursor-pointer overflow-hidden"
            >
              <PropertyImage
                src={gallery[0]}
                alt={`${title} 1`}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 60vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/15" />
            </div>

            {/* 2 Stacked Right Images */}
            <div className="grid h-full grid-rows-2 gap-3">
              <div
                onClick={() => openLightbox(1)}
                className="group relative h-full cursor-pointer overflow-hidden"
              >
                <PropertyImage
                  src={gallery[1]}
                  alt={`${title} 2`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 30vw, 25vw"
                />
                <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/15" />
              </div>

              <div
                onClick={() => openLightbox(2)}
                className="group relative h-full cursor-pointer overflow-hidden bg-slate-950"
              >
                <PropertyImage
                  src={gallery[2]}
                  alt={`${title} 3`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 30vw, 25vw"
                />
                <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/15" />

                {/* All Photos Trigger Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(0);
                  }}
                  className="badge-dark-blur absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <span>{allPhotosLabel}</span>
                </button>
              </div>
            </div>
          </div>
        ) : gallery.length === 2 ? (
          <div className="relative grid h-[380px] grid-cols-2 gap-3 overflow-hidden rounded-[28px] border border-slate-200/90 bg-slate-900 shadow-md">
            {gallery.map((img, idx) => (
              <div
                key={img}
                onClick={() => openLightbox(idx)}
                className="group relative h-full cursor-pointer overflow-hidden"
              >
                <PropertyImage
                  src={img}
                  alt={`${title} ${idx + 1}`}
                  fill
                  className="object-contain"
                  sizes="50vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/15" />
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => openLightbox(0)}
            className="group relative h-[400px] cursor-pointer overflow-hidden rounded-[28px] border border-slate-200/90 bg-slate-950 shadow-md"
          >
            <PropertyImage
              src={gallery[0]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/15" />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE IMMERSIVE SLIDER & SHEET HEADER (Visible on mobile) */}
      {/* ============================================================== */}
      <div className="w-full lg:hidden">
        {/* Tall Photo Slider */}
        <div className="relative w-full h-[50vh] min-h-[350px] max-h-[480px] overflow-hidden bg-slate-950 sm:rounded-[28px]">
          {/* Floating Top Actions (Back Button) */}
          {topActions ? (
            <div className="absolute left-3.5 top-3.5 z-20 flex items-center">
              {topActions}
            </div>
          ) : null}

          {/* Swipe Track */}
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {gallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                onClick={() => openLightbox(index)}
                className="relative h-full w-full shrink-0 snap-center cursor-pointer bg-slate-950 flex items-center justify-center"
              >
                <PropertyImage
                  src={image}
                  alt={`${title} ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Floating Actions on Bottom Left of Photo (Share & Heart) */}
          {floatingActions ? (
            <div className="absolute bottom-7 left-4 z-20 flex items-center gap-2.5">
              {floatingActions}
            </div>
          ) : null}

          {/* Floating Badges on Mobile Photo if provided */}
          {badges ? (
            <div className="absolute top-16 left-3.5 z-10 flex flex-wrap items-center gap-1.5">
              {badges}
            </div>
          ) : null}

          {/* Photo Counter Pill on Bottom Right of Photo */}
          {gallery.length > 1 ? (
            <div className="badge-dark-blur absolute bottom-7 right-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md">
              <span>
                {activeIndex + 1} / {gallery.length}
              </span>
            </div>
          ) : null}
        </div>

        {/* White Bottom Sheet Top: 4 Mini Thumbnails Strip */}
        <div className="relative z-10 -mt-6 rounded-t-[32px] bg-white px-4 pt-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
          {gallery.length > 1 ? (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {gallery.slice(0, 4).map((img, idx) => {
                const isLast = idx === 3 && gallery.length > 4;
                const remainingCount = gallery.length - 3;
                const isActive = activeIndex === idx;

                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => (isLast ? openLightbox(3) : scrollToIndex(idx))}
                    className={`relative h-16 flex-1 min-w-[70px] max-w-[95px] overflow-hidden rounded-2xl border-2 transition active:scale-95 ${
                      isActive
                        ? "border-blue-600 ring-2 ring-blue-500/30"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <PropertyImage
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {isLast ? (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center text-white font-display text-xs font-black">
                        +{remainingCount}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FULLSCREEN LIGHTBOX MODAL                                  */}
      {/* ============================================================== */}
      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between px-4 py-3.5 text-white">
            <span className="text-sm font-bold text-slate-300">
              {lightboxIndex + 1} / {gallery.length}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-95"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Active Image Stage with Next/Prev Arrows */}
          <div className="relative flex flex-1 items-center justify-center p-2 sm:p-6">
            {gallery.length > 1 ? (
              <button
                type="button"
                onClick={prevLightbox}
                className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/80 active:scale-95 sm:left-6"
                aria-label="Previous"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            ) : null}

            <div className="relative h-full w-full max-w-5xl">
              <PropertyImage
                src={gallery[lightboxIndex]}
                alt={`${title} ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {gallery.length > 1 ? (
              <button
                type="button"
                onClick={nextLightbox}
                className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/80 active:scale-95 sm:right-6"
                aria-label="Next"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : null}
          </div>

          {/* Thumbnail Strip at the Bottom */}
          {gallery.length > 1 ? (
            <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-3 bg-black/40">
              {gallery.map((img, idx) => (
                <button
                  key={`${img}-thumb`}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    lightboxIndex === idx
                      ? "border-blue-500 scale-105 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <PropertyImage
                    src={img}
                    alt="thumb"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
