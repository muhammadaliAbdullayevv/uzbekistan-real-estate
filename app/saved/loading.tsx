export default function SavedLoading() {
  return (
    <div className="shell py-4 sm:py-6 space-y-6">
      {/* Header skeleton */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 space-y-3 animate-pulse">
        <div className="h-6 w-32 rounded-xl bg-slate-100" />
        <div className="h-8 w-56 rounded-xl bg-slate-200" />
        <div className="h-4 w-72 rounded-lg bg-slate-100" />
        <div className="pt-2 flex gap-2">
          <div className="h-7 w-24 rounded-xl bg-slate-200" />
          <div className="h-7 w-20 rounded-xl bg-slate-100" />
          <div className="h-7 w-20 rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="space-y-3 md:hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200/90 bg-white p-3 space-y-2.5 animate-pulse">
            <div className="flex gap-3">
              <div className="aspect-square w-28 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-4 w-32 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-8 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-[22px] border border-slate-200/90 bg-white overflow-hidden space-y-3 p-4 animate-pulse">
            <div className="aspect-[4/3] w-full rounded-xl bg-slate-200" />
            <div className="h-6 w-28 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-9 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
