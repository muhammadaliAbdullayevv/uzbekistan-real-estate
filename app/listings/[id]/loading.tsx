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
        <div className="w-full mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
          {/* Desktop Mosaic */}
          <div className="hidden lg:grid h-[420px] grid-cols-3 gap-3 overflow-hidden rounded-[28px]">
            <div className="col-span-2 h-full animate-pulse rounded-[28px] bg-slate-200" />
            <div className="grid h-full grid-rows-2 gap-3">
              <div className="h-full animate-pulse rounded-[28px] bg-slate-200" />
              <div className="h-full animate-pulse rounded-[28px] bg-slate-200" />
            </div>
          </div>

          {/* Mobile Tall Photo */}
          <div className="lg:hidden w-full h-[50vh] min-h-[350px] max-h-[480px] animate-pulse bg-slate-900" />

          {/* Mobile Sheet Top: 4 Mini Thumbnails Strip Skeleton */}
          <div className="lg:hidden relative z-10 -mt-6 rounded-t-[32px] bg-white px-4 pt-3.5 pb-1 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 flex-1 min-w-[70px] max-w-[95px] animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Skeleton */}
      <div className="bg-white px-4 pb-28 space-y-4 sm:px-6 lg:shell lg:mt-6 lg:bg-transparent lg:p-0">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_410px] lg:gap-8 items-start">
          
          {/* Left column */}
          <div className="space-y-4 sm:space-y-5">
            {/* Sub-badge, Title & Views skeleton */}
            <div className="space-y-2 pt-1 lg:panel lg:p-5 animate-pulse">
              <div className="h-3.5 w-36 rounded bg-slate-200" />
              <div className="h-6 w-5/6 rounded-lg bg-slate-200" />
              <div className="h-3.5 w-1/2 rounded bg-slate-100" />
              <div className="h-3 w-16 rounded bg-slate-100" />
            </div>

            {/* 4-Specs in One Row skeleton */}
            <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-100 lg:panel lg:p-4">
              <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-1 space-y-1">
                    <div className="h-6 w-12 mx-auto rounded bg-slate-200" />
                    <div className="h-3 w-10 mx-auto rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description skeleton */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2 lg:panel lg:p-6 animate-pulse">
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-5/6 rounded bg-slate-200" />
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 pt-3 pb-3 backdrop-blur-xl lg:hidden animate-pulse space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
