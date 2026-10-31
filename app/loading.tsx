// Generic fallback -- shown for any route that doesn't define its own
// loading.tsx (this one sits at the root, so it's the ancestor Suspense
// boundary for the whole app). Kept content-neutral on purpose since it
// has to look reasonable on every page, not just the homepage.
export default function Loading() {
  return (
    <div className="shell space-y-4 py-6">
      <div className="h-8 w-40 animate-pulse rounded-full bg-mist" />
      <div className="h-32 animate-pulse rounded-[24px] bg-mist" />
      <div className="h-32 animate-pulse rounded-[24px] bg-mist" />
    </div>
  );
}
