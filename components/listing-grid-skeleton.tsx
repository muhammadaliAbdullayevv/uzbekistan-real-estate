function ListingCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0D1219] sm:rounded-[30px]">
      <div className="aspect-[16/10] animate-pulse bg-mist sm:aspect-[4/3]" />
      <div className="space-y-2.5 p-3.5 sm:space-y-4 sm:p-6">
        <div className="h-3 w-16 animate-pulse rounded-full bg-mist" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-mist" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-mist" />
        <div className="h-9 w-full animate-pulse rounded-full bg-mist" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}
