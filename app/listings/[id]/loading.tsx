export default function ListingLoading() {
  return (
    <div className="shell -mt-8 space-y-5 pb-28 sm:mt-0 sm:space-y-8 sm:pb-12 min-h-screen">
      {/* 1. Desktop Breadcrumbs & Top Bar skeleton */}
      <div className="hidden lg:flex items-center justify-between">
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

      {/* 2. Desktop Title & Badges skeleton */}
      <div className="hidden lg:block space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="h-8 w-2/3 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-slate-200" />
      </div>

      {/* 3. Photo Gallery skeleton */}
      {/* Desktop Mosaic skeleton */}
      <div className="hidden lg:grid h-[420px] grid-cols-3 gap-3 overflow-hidden rounded-[28px]">
        <div className="col-span-2 h-full animate-pulse rounded-[28px] bg-slate-200" />
        <div className="grid h-full grid-rows-2 gap-3">
          <div className="h-full animate-pulse rounded-[28px] bg-slate-200" />
          <div className="h-full animate-pulse rounded-[28px] bg-slate-200" />
        </div>
      </div>

      {/* Mobile Photo skeleton */}
      <div className="lg:hidden -mx-4 overflow-hidden sm:mx-0 sm:rounded-[28px]">
        <div className="aspect-[4/3] w-full animate-pulse bg-slate-200" />
      </div>

      {/* 4. Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1.3fr)_410px] lg:gap-8 items-start">
        {/* Left column */}
        <div className="space-y-5 sm:space-y-6">
          {/* Mobile-only Price & Title Block skeleton */}
          <div className="panel space-y-3 p-4 sm:p-5 lg:hidden animate-pulse">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1.5">
                <div className="h-7 w-32 rounded-lg bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
              <div className="h-6 w-24 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-4/5 rounded-md bg-slate-200" />
              <div className="h-4 w-1/2 rounded-md bg-slate-200" />
            </div>
          </div>

          {/* 4-Spec Quick Highlight Grid skeleton */}
          <div className="panel p-4 sm:p-5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 mb-3" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>

          {/* Mobile Owner Card skeleton */}
          <div className="lg:hidden rounded-[24px] border border-slate-100 bg-slate-50 p-4 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-3 w-36 rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-9 w-24 rounded-xl bg-slate-200" />
          </div>

          {/* Collapsible Description skeleton */}
          <div className="panel space-y-3 p-4 sm:p-6 animate-pulse">
            <div className="h-5 w-36 rounded bg-slate-200" />
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          </div>

          {/* Amenities skeleton */}
          <div className="panel space-y-3 p-4 sm:p-6 animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-24 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>

          {/* Infrastructure skeleton */}
          <div className="panel space-y-3 p-4 sm:p-6 animate-pulse">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>

          {/* Map skeleton */}
          <div className="panel space-y-3 p-4 sm:p-6 animate-pulse">
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="h-48 w-full rounded-2xl bg-slate-100" />
          </div>
        </div>

        {/* Right column (desktop sticky card skeleton) */}
        <aside className="hidden lg:block sticky top-24 space-y-4">
          <div className="panel space-y-5 p-6 animate-pulse">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="h-9 w-44 rounded-lg bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-100" />
              <div className="flex gap-2 pt-2">
                <div className="h-5 w-24 rounded bg-slate-100" />
                <div className="h-5 w-28 rounded bg-slate-100" />
              </div>
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
              <div className="h-11 w-full rounded-2xl bg-slate-100" />
            </div>

            <div className="h-3 w-48 mx-auto rounded bg-slate-100" />
          </div>
        </aside>
      </div>

      {/* 5. Mobile Sticky Deal Bar skeleton */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden animate-pulse">
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
