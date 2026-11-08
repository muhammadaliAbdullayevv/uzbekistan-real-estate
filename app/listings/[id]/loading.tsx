export default function ListingLoading() {
  return (
    <div className="min-h-screen pb-28">
      {/* 1. Desktop Breadcrumbs skeleton */}
      <div className="shell hidden lg:flex items-center justify-between pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded-md bg-slate-200" />
          <span className="text-slate-300">›</span>
          <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200" />
          <span className="text-slate-300">›</span>
          <div className="h-4 w-44 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      {/* 2. Photo Gallery skeleton (at top: 0) */}
      <div className="w-full">
        <div className="shell lg:px-8 px-0 sm:px-6">
          {/* Desktop Mosaic */}
          <div className="hidden lg:grid h-[420px] grid-cols-3 gap-3 overflow-hidden rounded-[28px]">
            <div className="col-span-2 h-full animate-pulse rounded-[28px] bg-slate-200" />
            <div className="grid h-full grid-rows-2 gap-3">
              <div className="h-full animate-pulse rounded-[28px] bg-slate-200" />
              <div className="h-full animate-pulse rounded-[28px] bg-slate-200" />
            </div>
          </div>

          {/* Mobile Photo */}
          <div className="lg:hidden w-full aspect-[4/3] sm:aspect-[16/10] animate-pulse bg-slate-900" />
        </div>
      </div>

      {/* 3. Main Content Skeleton */}
      <div className="shell mt-4 space-y-4 sm:space-y-6 sm:mt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_410px] lg:gap-8 items-start">
          
          {/* Left column */}
          <div className="space-y-4 sm:space-y-5">
            {/* Location, Title & Price skeleton */}
            <div className="panel space-y-3 p-4 sm:p-5 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-6 w-5/6 rounded-lg bg-slate-200" />
              <div className="h-3.5 w-1/2 rounded bg-slate-100" />
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <div className="h-7 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
                <div className="h-5 w-24 rounded-full bg-slate-100" />
              </div>
            </div>

            {/* 4-Specs in One Row skeleton */}
            <div className="panel p-3 sm:p-4">
              <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-1 space-y-1">
                    <div className="h-6 w-12 mx-auto rounded bg-slate-200" />
                    <div className="h-3 w-10 mx-auto rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Landlord card skeleton */}
            <div className="panel p-3.5 sm:p-4 bg-slate-50 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="h-3 w-36 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-8 w-20 rounded-xl bg-slate-200" />
            </div>

            {/* Description skeleton */}
            <div className="panel space-y-3 p-4 sm:p-6 animate-pulse">
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-5/6 rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Right column (desktop sticky card skeleton) */}
          <aside className="hidden lg:block sticky top-24 space-y-4">
            <div className="panel space-y-5 p-6 animate-pulse">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="h-9 w-44 rounded-lg bg-slate-200" />
                <div className="h-4 w-28 rounded bg-slate-100" />
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="h-3 w-36 rounded bg-slate-100" />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="h-12 w-full rounded-2xl bg-slate-200" />
                <div className="h-11 w-full rounded-2xl bg-slate-100" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 4. Unclosable Sticky Bottom Bar skeleton */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden animate-pulse">
        <div className="min-w-[85px] space-y-1">
          <div className="h-5 w-20 rounded bg-slate-200" />
          <div className="h-3 w-12 rounded bg-slate-100" />
        </div>
        <div className="h-11 flex-1 rounded-xl bg-slate-100" />
        <div className="h-11 flex-1 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
