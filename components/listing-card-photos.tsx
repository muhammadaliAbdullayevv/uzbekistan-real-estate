"use client";

import { useEffect, useState } from "react";

import { PropertyImage } from "@/components/property-image";

type ListingCardPhotosProps = {
  images: string[];
  alt: string;
};

const CYCLE_INTERVAL_MS = 3500;
// Cap how many photos auto-cycle per card -- stacking all of a listing's
// photos (up to 10) would mean loading all of them upfront for every card
// on the page, which doesn't scale on a photo-heavy grid.
const MAX_CYCLE_PHOTOS = 4;

export function ListingCardPhotos({ images, alt }: ListingCardPhotosProps) {
  const photos = images.slice(0, MAX_CYCLE_PHOTOS);
  const displayPhotos = photos.length > 0 ? photos : [undefined];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (displayPhotos.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayPhotos.length);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [displayPhotos.length]);

  return (
    <>
      {displayPhotos.map((src, index) => (
        <PropertyImage
          key={`${src ?? "placeholder"}-${index}`}
          src={src}
          alt={alt}
          fill
          className={`object-cover transition duration-700 group-hover:scale-[1.05] ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
      ))}
    </>
  );
}
