export function DriverCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Image area */}
      <div className="relative aspect-[5/3] bg-gray-200">
        <div className="absolute top-3 left-3 w-20 h-6 bg-gray-300/50 rounded-lg" />
        <div className="absolute top-3 right-3 w-24 h-6 bg-gray-300/50 rounded-lg" />
        <div className="absolute bottom-3 left-3 w-10 h-10 bg-gray-300/50 rounded-xl" />
      </div>

      {/* Content area */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="flex gap-1.5">
            <div className="h-5 bg-gray-100 rounded-md w-16" />
            <div className="h-5 bg-gray-100 rounded-md w-14" />
            <div className="h-5 bg-gray-100 rounded-md w-12" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
          <div className="h-8 bg-gray-100 rounded-lg" />
          <div className="h-8 bg-gray-100 rounded-lg" />
          <div className="h-8 bg-gray-100 rounded-lg" />
        </div>
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
