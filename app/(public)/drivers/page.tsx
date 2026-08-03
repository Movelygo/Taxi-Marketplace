import { DriverService } from '@/modules/drivers/services/driver.service'
import { CityService } from '@/modules/cities/services/city.service'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { DriverGrid } from '@/components/public/DriverGrid'
import { CityFilter } from '@/components/public/city-filter'
import Link from 'next/link'

export const metadata = {
  title: 'Browse Drivers | Movely',
  description: 'Browse independent drivers serving Maryland, Baltimore, and the DC area. Filter by city and contact drivers directly.',
}

export const dynamic = 'force-dynamic'

interface DriversPageProps {
  searchParams: Promise<{ city?: string }>
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const params = await searchParams
  const selectedCity = params.city

  const [drivers, cities] = await Promise.all([
    DriverService.getPublicDrivers(selectedCity),
    CityService.getAllActive(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <PageViewTracker
        eventName="public_directory_viewed"
        properties={{ city: selectedCity || 'all', driver_count: drivers.length }}
      />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Browse drivers
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Independent drivers serving Maryland, Baltimore, and the DC area. Filter by city and contact them directly.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <label htmlFor="city" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Filter by city
              </label>
              <CityFilter cities={cities} selectedCity={selectedCity} />
            </div>
          </form>

          {selectedCity && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Showing drivers in <strong className="text-gray-900">{selectedCity}</strong></span>
              <Link href="/drivers" className="text-[#0B1F3D] font-semibold hover:underline">
                Clear filter
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {drivers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-600">
              {selectedCity
                ? `We couldn't find any drivers available in ${selectedCity}.`
                : 'No drivers are currently available.'}
            </p>
          </div>
        ) : (
          <DriverGrid drivers={drivers} />
        )}
      </div>
    </div>
  )
}
