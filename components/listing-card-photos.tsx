import { PropertyImage } from "@/components/property-image";

type ListingCardPhotosProps = {
  images: string[];
  alt: string;
};

export function ListingCardPhotos({ images, alt }: ListingCardPhotosProps) {
  const coverSrc = images[0];

  return (
    <PropertyImage
      src={coverSrc}
      alt={alt}
      fill
      className="object-cover transition duration-500 group-hover:scale-[1.04]"
      sizes="(max-width: 1024px) 50vw, 33vw"
    />
  );
}
