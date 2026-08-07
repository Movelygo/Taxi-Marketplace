import Link from 'next/link'
import Image from 'next/image'

interface Driver {
  id: string
  slug: string
  displayName: string
  city: string
  vehicleType: string
  languages: string[]
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  profileImageUrl?: string | null
  whatsappNumber?: string
  phone?: string
}

interface DriverGridProps {
  drivers: Driver[]
}

export function DriverGrid({ drivers }: DriverGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drivers.map((driver) => (
        <article
          key={driver.id}
          className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
        >
          {/* Driver Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar with Online Status */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white shadow-md">
                {driver.profileImageUrl ? (
                  <Image
                    src={driver.profileImageUrl}
                    alt={driver.displayName}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600 text-lg font-bold">
                    {driver.displayName.charAt(0)}
                  </div>
                )}
              </div>
              {driver.availabilityStatus === 'AVAILABLE' && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* Name and Status */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                {driver.displayName}
              </h3>
              {driver.availabilityStatus === 'AVAILABLE' && (
                <p className="text-sm font-medium text-green-600">Online Now</p>
              )}
              {driver.availabilityStatus === 'BUSY' && (
                <p className="text-sm font-medium text-amber-600">Currently Busy</p>
              )}
              {driver.availabilityStatus === 'OFFLINE' && (
                <p className="text-sm font-medium text-gray-500">Offline</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <span>{driver.vehicleType}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
              <span>{driver.languages.join(', ')}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{driver.city}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Call
            </button>
            
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
          </div>

          {/* View Profile Link Overlay */}
          <Link href={`/drivers/${driver.slug}`} className="absolute inset-0 rounded-2xl" aria-label={`View ${driver.displayName} profile`}>
            <span className="sr-only">View profile</span>
          </Link>
        </article>
      ))}

      {/* Join the Network Card */}
      <article className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[300px] hover:border-gray-400 hover:bg-gray-50 transition-all">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Join the Network</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-[200px]">
          Become a verified driver and reach premium clients.
        </p>
        <Link 
          href="/register"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F] transition-colors"
        >
          Register Now
        </Link>
      </article>
    </div>
  )
}
