import { ListingGridSkeleton } from "@/components/listing-grid-skeleton";

export default function SavedLoading() {
  return (
    <div className="shell space-y-8">
      <div className="h-28 animate-pulse rounded-[24px] bg-mist sm:h-32" />
      <ListingGridSkeleton count={6} />
    </div>
  );
}
