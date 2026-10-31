export default function AccountLoading() {
  return (
    <div className="shell space-y-8">
      <div className="h-5 w-32 animate-pulse rounded-full bg-mist" />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="panel space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-mist" />
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded-full bg-mist" />
              <div className="h-3 w-28 animate-pulse rounded-full bg-mist" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-2xl bg-mist" />
            <div className="h-10 animate-pulse rounded-2xl bg-mist" />
            <div className="h-10 animate-pulse rounded-2xl bg-mist" />
          </div>
        </div>
        <div className="surface-tint space-y-3 p-4 sm:p-5">
          <div className="h-11 animate-pulse rounded-full bg-mist" />
          <div className="h-9 animate-pulse rounded-full bg-mist" />
          <div className="h-9 animate-pulse rounded-full bg-mist" />
          <div className="h-9 animate-pulse rounded-full bg-mist" />
        </div>
      </div>
    </div>
  );
}
