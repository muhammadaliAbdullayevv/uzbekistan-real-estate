// Generic fallback -- shown for any route that doesn't define its own
// loading.tsx (this one sits at the root, so it's the ancestor Suspense
// boundary for the whole app). Kept content-neutral on purpose since it
// has to look reasonable on every page, not just the homepage.
export default function Loading() {
  return (
    <div className="shell min-h-[70vh] space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100 hidden sm:block" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl border border-slate-100 bg-white p-3 space-y-3 shadow-xs"
          >
            <div className="aspect-[4/3] w-full rounded-2xl bg-slate-200" />
            <div className="space-y-2 px-1">
              <div className="h-5 w-3/4 rounded-md bg-slate-200" />
              <div className="h-4 w-1/2 rounded-md bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
