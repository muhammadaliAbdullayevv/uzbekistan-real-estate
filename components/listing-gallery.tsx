"use client";

import { useRef, useState } from "react";

import { PropertyImage } from "@/components/property-image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type ListingGalleryProps = {
  images: string[];
  title: string;
};

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const gallery = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const clamped = Math.max(0, Math.min(index, gallery.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) {
      return;
    }
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex((current) => (current === index ? current : index));
  }

  return (
    <div className="panel relative overflow-hidden">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto scroll-smooth sm:aspect-[16/10]"
      >
        {gallery.map((image, index) => (
          <div key={`${image}-${index}`} className="relative h-full w-full shrink-0 snap-center">
            <PropertyImage
              src={image}
              alt={`${title} ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 70vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {gallery.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === gallery.length - 1}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {gallery.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
