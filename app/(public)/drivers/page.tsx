import { DriverService } from '@/modules/drivers/services/driver.service'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Find a Driver | Movely',
  description: 'Browse our directory of verified drivers in the Baltimore, DC Metro area',
}

interface DriversPageProps {
  searchParams: Promise<{ city?: string }>
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const params = await searchParams
  const selectedCity = params.city

  const drivers = await DriverService.getPublicDrivers(selectedCity)
  const cities = await DriverService.getAvailableCities()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Driver</h1>
          <p className="text-gray-600">Browse verified drivers in your area</p>
        </div>

        {cities.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/drivers"
              className={`px-4 py-2 rounded-full border ${
                !selectedCity
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              All Cities
            </Link>
            {cities.map((city) => (
              <Link
                key={city}
                href={`/drivers?city=${encodeURIComponent(city)}`}
                className={`px-4 py-2 rounded-full border ${
                  selectedCity === city
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {city}
              </Link>
            ))}
          </div>
        )}

        {drivers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                {selectedCity
                  ? `No drivers found in ${selectedCity}`
                  : 'No drivers available at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <Link key={driver.id} href={`/drivers/${driver.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {driver.profileImageUrl && (
                      <div className="flex justify-center mb-4">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                          <Image
                            src={driver.profileImageUrl}
                            alt={driver.displayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <CardTitle className="text-xl text-center">{driver.displayName}</CardTitle>
                    <CardDescription className="text-center">{driver.city}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Vehicle:</span> {driver.vehicleType}
                      </div>
                      <div>
                        <span className="font-medium">Languages:</span> {driver.languages.join(', ')}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          driver.availabilityStatus === 'AVAILABLE'
                            ? 'bg-green-100 text-green-800'
                            : driver.availabilityStatus === 'BUSY'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.availabilityStatus}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
