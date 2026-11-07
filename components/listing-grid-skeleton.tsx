function ListingCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200/90 bg-white sm:rounded-[26px]">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-2.5 p-3.5 sm:space-y-4 sm:p-5">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
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
