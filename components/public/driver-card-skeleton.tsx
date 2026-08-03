export function DriverCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-9 bg-gray-100 rounded-lg" />
        <div className="h-9 bg-gray-100 rounded-lg" />
        <div className="h-9 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

export function DriverGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DriverCardSkeleton key={i} />
      ))}
    </div>
  )
}
