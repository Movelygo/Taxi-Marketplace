import { DriverService } from '@/modules/drivers/services/driver.service'
import Link from 'next/link'
import Image from 'next/image'

/**
 * Featured drivers section for the homepage.
 *
 * Honesty rule: if there are no featured drivers, this component renders
 * nothing at all — no fake placeholder cards, no "no featured drivers yet"
 * empty state. Better to hide than fake.
 */
export async function FeaturedDriversSection() {
  const featured = await DriverService.getFeaturedDrivers(3)

  if (featured.length === 0) {
    return null
  }

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
              Featured drivers
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Drivers worth knowing
            </h2>
            <p className="text-base text-gray-600 mt-2 max-w-xl">
              A handpicked selection of drivers serving Maryland, Baltimore, and the DC area.
            </p>
          </div>
          <Link
            href="/drivers"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#0B1F3D] hover:underline flex-shrink-0"
          >
            See all drivers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((driver) => (
            <Link
              key={driver.id}
              href={`/drivers/${driver.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-[#0B1F3D] transition-all flex items-center gap-4"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-[#0B1F3D]/5 flex-shrink-0">
                {driver.profileImageUrl ? (
                  <Image
                    src={driver.profileImageUrl}
                    alt={driver.displayName}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0B1F3D] font-bold text-xl">
                    {driver.displayName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[#0B1F3D] transition-colors">
                  {driver.displayName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {driver.vehicleType}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {driver.city}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#0B1F3D] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Mobile-only "See all" link */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/drivers"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B1F3D]"
          >
            See all drivers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
