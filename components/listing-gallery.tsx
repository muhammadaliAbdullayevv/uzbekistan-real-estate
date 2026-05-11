import { PropertyImage } from "@/components/property-image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type ListingGalleryProps = {
  images: string[];
  title: string;
};

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const gallery = images.length > 0 ? images : [PLACEHOLDER_IMAGE];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border bg-white shadow-soft">
        <PropertyImage
          src={gallery[0]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 70vw"
        />
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.slice(1).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-[24px] border bg-white"
            >
              <PropertyImage
                src={image}
                alt={`${title} ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
