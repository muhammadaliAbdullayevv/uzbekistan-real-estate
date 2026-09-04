"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getSafeListingImageUrl, isLocalImageUrl } from "@/lib/image-url";

type PropertyImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export function PropertyImage({ src, alt, ...props }: PropertyImageProps) {
  const normalizedSrc = getSafeListingImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={isLocalImageUrl(currentSrc)}
      onError={() => {
        if (currentSrc !== PLACEHOLDER_IMAGE) {
          setCurrentSrc(PLACEHOLDER_IMAGE);
        }
      }}
    />
  );
}
