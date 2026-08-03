import { DriverService } from '@/modules/drivers/services/driver.service'
import { CityService } from '@/modules/cities/services/city.service'
import { getActiveProfileAttributes } from '@/modules/drivers/actions/get-profile-attributes'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { DirectoryClient } from '@/components/public/directory-client'
import type { FilterState } from '@/components/public/directory-filters'
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
  const q = (params.q as string) || ''
  const city = (params.city as string) || ''
  const vehicleType = (params.vehicleType as string) || ''
  const amenitiesParam = params.amenities
  const amenities = Array.isArray(amenitiesParam) ? amenitiesParam : amenitiesParam ? [amenitiesParam] : []
  const paymentMethodsParam = params.paymentMethods
  const paymentMethods = Array.isArray(paymentMethodsParam) ? paymentMethodsParam : paymentMethodsParam ? [paymentMethodsParam] : []
  const minCapacity = (params.minCapacity as string) || ''
  const availabilityStatus = (params.availabilityStatus as string) || ''
  const sort = (params.sort as 'featured' | 'newest') || 'featured'
  const page = Math.max(1, parseInt((params.page as string) || '1', 10))

  const filters: FilterState = {
    q,
    city,
    vehicleType,
    amenities,
    paymentMethods,
    minCapacity,
    availabilityStatus,
    sort,
  }

  // Fetch initial data server-side
  const [searchResult, cities, attrs] = await Promise.all([
    DriverService.searchPublicDrivers({
      q: q || undefined,
      city: city || undefined,
      vehicleType: vehicleType || undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined,
      minCapacity: minCapacity ? parseInt(minCapacity, 10) : undefined,
      availabilityStatus: availabilityStatus || undefined,
      sort,
      page,
      pageSize: 12,
    }),
    CityService.getAllActive(),
    getActiveProfileAttributes(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <PageViewTracker
        eventName="public_directory_viewed"
        properties={{
          city: city || 'all',
          driver_count: searchResult.total,
          has_search: !!q,
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
          amenities={attrs.amenities}
          paymentMethods={attrs.paymentMethods}
          initialDrivers={searchResult.drivers}
          initialTotal={searchResult.total}
          initialPage={searchResult.page}
          initialPageSize={searchResult.pageSize}
          initialFilters={filters}
          searchParamsObj={params}
        />
      </Suspense>
    </div>
  )
}
