import Link from 'next/link'
import Image from 'next/image'
import { getWhatsAppLink, getPhoneCallLink } from '@/lib/utils/phone'
import { DEFAULT_AMENITIES } from '@/modules/drivers/constants/profile-attributes'
import type { DriverSearchResultItem } from '@/modules/drivers/types/search'

// Map amenity keys to labels + icons for display
const AMENITY_MAP: Map<string, string> = new Map(
  DEFAULT_AMENITIES.map((a) => [a.key, a.label] as [string, string])
)

const AMENITY_ICONS: Record<string, string> = {
  'A/C': '❄',
  'Wi-Fi': '📶',
  'Phone charger': '🔌',
  'Child seat': '👶',
  'Pet-friendly': '🐾',
  'Wheelchair accessible': '♿',
  'Large trunk': '📦',
  'Non-smoker': '🚭',
  'Night service': '🌙',
  'Airport specialist': '✈',
  'Long-distance / interstate': '🛣',
}

export function DriverCard({ driver }: { driver: DriverSearchResultItem }) {
  const whatsappLink = getWhatsAppLink(
    driver.whatsappNumber,
    `Hi ${driver.displayName}, I found you on Movely and would like to ask about a ride.`,
  )
  const phoneLink = getPhoneCallLink(driver.phone)

  const cityName = driver.cityRel?.name || driver.city
  const stateCode = driver.cityRel?.state || ''
  const vehicleLabel = [driver.vehicleMake, driver.vehicleModel].filter(Boolean).join(' ') || driver.vehicleType
  const topAmenities = driver.amenities.slice(0, 3)

  return (
    <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#0B1F3D] transition-all flex flex-col">
      {/* Featured badge */}
      {driver.isFeatured && (
        <div className="bg-[#0B1F3D] text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Featured
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header — clickable */}
        <Link
          href={`/drivers/${driver.slug}`}
          className="flex items-start gap-3 mb-4 group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#0B1F3D]/5 border border-gray-200">
              {driver.profileImageUrl ? (
                <Image
                  src={driver.profileImageUrl}
                  alt={driver.displayName}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#0B1F3D] text-lg font-bold">
                  {driver.displayName.charAt(0)}
                </div>
              )}
            </div>
            {driver.availabilityStatus === 'AVAILABLE' && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[#0B1F3D] transition-colors">
              {driver.displayName}
            </h3>
            <p
              className={`text-xs font-semibold mt-0.5 ${
                driver.availabilityStatus === 'AVAILABLE'
                  ? 'text-green-600'
                  : driver.availabilityStatus === 'BUSY'
                    ? 'text-amber-600'
                    : 'text-gray-500'
              }`}
            >
              {driver.availabilityStatus === 'AVAILABLE'
                ? 'Available now'
                : driver.availabilityStatus === 'BUSY'
                  ? 'Currently busy'
                  : 'Offline'}
            </p>
          </div>
        </Link>

        {/* Quick facts strip */}
        <div className="space-y-2 mb-4 flex-1">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{cityName}{stateCode && `, ${stateCode}`}</span>
          </div>

          {/* Vehicle */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <span className="truncate">
              {vehicleLabel}
              {driver.passengerCapacity && (
                <span className="text-gray-400"> · {driver.passengerCapacity} seats</span>
              )}
            </span>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="truncate">{driver.languages.join(', ')}</span>
          </div>

          {/* Amenity pills */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topAmenities.map((a) => {
                const label = AMENITY_MAP.get(a) || a
                return (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                  >
                    {AMENITY_ICONS[label] && <span>{AMENITY_ICONS[label]}</span>}
                    {label}
                  </span>
                )
              })}
              {driver.amenities.length > 3 && (
                <span className="px-2 py-0.5 text-gray-400 text-xs">
                  +{driver.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contact actions */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={phoneLink}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
            aria-label={`Call ${driver.displayName}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-2 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors"
            aria-label={`WhatsApp ${driver.displayName}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>
          <Link
            href={`/drivers/${driver.slug}`}
            className="inline-flex items-center justify-center gap-1 px-2 py-2.5 bg-[#0B1F3D] hover:bg-[#001F3F] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
    </article>
  )
}
