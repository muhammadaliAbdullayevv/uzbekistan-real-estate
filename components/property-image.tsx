"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getSafeListingImageUrl } from "@/lib/image-url";

type PropertyImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export function PropertyImage({ src, alt, ...props }: PropertyImageProps) {
  const normalizedSrc = getSafeListingImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  const isLocalAsset =
    currentSrc.startsWith("/") || currentSrc.endsWith(".svg");

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={isLocalAsset}
      onError={() => {
        if (currentSrc !== PLACEHOLDER_IMAGE) {
          setCurrentSrc(PLACEHOLDER_IMAGE);
        }
      }}
    />
  );
}
