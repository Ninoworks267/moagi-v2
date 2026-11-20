export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="skeleton aspect-[4/3] w-full rounded-3xl" />
      <div className="space-y-2 px-1 pt-4">
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
        <div className="skeleton h-3 w-full rounded-md" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
        <p className="text-sm text-ink/45">Loading…</p>
      </div>
    </div>
  );
}

export function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
