import { DriverService } from '@/modules/drivers/services/driver.service'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { DirectoryClient } from '@/components/public/directory-client'
import type { FilterState } from '@/components/public/directory-filters'
import { driverSearchQuerySchema } from '@/modules/drivers/validations/driver-search.schema'
import { Suspense } from 'react'

export const metadata = {
  title: 'Browse Drivers | Movely',
  description: 'Browse independent drivers serving Maryland, Baltimore, and the DC area. Filter by city, vehicle type, amenities and contact drivers directly.',
}

export const dynamic = 'force-dynamic'

interface DriversPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const params = await searchParams

  // Parse filters from URL
  const parsed = driverSearchQuerySchema.safeParse(params)
  const query = parsed.success ? parsed.data : driverSearchQuerySchema.parse({})

  const filters: FilterState = {
    q: query.q || '',
    city: query.city || '',
    vehicleType: query.vehicleType || '',
    amenities: query.amenities,
    paymentMethods: query.paymentMethods,
    minCapacity: query.minCapacity ? String(query.minCapacity) : '',
    availabilityStatus: query.availabilityStatus || '',
    sort: query.sort,
  }

  // Fetch all directory data in a single consolidated call
  // (uses one Prisma client, minimizes concurrent DB connections)
  const { searchResult, cities, amenities: amenityAttrs, paymentMethods: paymentAttrs } =
    await DriverService.getDirectoryData({
      ...query,
      pageSize: 12,
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <PageViewTracker
        eventName="public_directory_viewed"
        properties={{
          city: filters.city || 'all',
          driver_count: searchResult.total,
          has_search: !!filters.q,
          filter_count: Object.values(filters).filter((v) => (Array.isArray(v) ? v.length > 0 : !!v)).length,
        }}
      />

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Browse drivers
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Independent drivers serving Maryland, Baltimore, and the DC area. Filter by city, vehicle, and amenities — then contact them directly.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-12"><div className="animate-pulse text-gray-400">Loading directory...</div></div>}>
        <DirectoryClient
          cities={cities}
          amenities={amenityAttrs}
          paymentMethods={paymentAttrs}
          initialDrivers={searchResult.drivers}
          initialTotal={searchResult.total}
          initialPage={searchResult.page}
          initialPageSize={searchResult.pageSize}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  )
}
