export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-40 rounded-lg skeleton-shimmer mt-2" />
        </div>
        <div className="h-10 w-48 rounded-lg skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl skeleton-shimmer" />
        <div className="h-80 rounded-xl skeleton-shimmer" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-xl skeleton-shimmer" />
        <div className="h-72 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}
