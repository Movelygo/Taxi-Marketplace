import Link from 'next/link'
import Image from 'next/image'
import { getWhatsAppLink, getPhoneCallLink } from '@/lib/utils/phone'
import { DEFAULT_AMENITIES } from '@/modules/drivers/constants/profile-attributes'
import { AMENITY_ICONS, MapPin, Car, Phone, MessageCircle, Star, ArrowRight } from '@/components/ui/icons'
import type { DriverSearchResultItem } from '@/modules/drivers/types/search'

// Map amenity keys to labels for display
const AMENITY_LABELS: Map<string, string> = new Map(
  DEFAULT_AMENITIES.map((a) => [a.key, a.label] as [string, string])
)

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

  // First gallery photo (sorted by sortOrder, already limited to 1 in the query)
  const heroPhoto = driver.photos?.[0]?.url || null

  return (
    <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#0B1F3D]/20 transition-all flex flex-col group">
      {/* ── Media Section ── */}
      <Link href={`/drivers/${driver.slug}`} className="relative block aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={`${driver.displayName}'s vehicle`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : driver.profileImageUrl ? (
          <Image
            src={driver.profileImageUrl}
            alt={driver.displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Fallback: branded gradient with initial
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3D] to-[#1a3a5c] flex items-center justify-center">
            <span className="text-5xl font-black text-white/20 select-none">
              {driver.displayName.charAt(0)}
            </span>
          </div>
        )}

        {/* Featured badge — top-left floating */}
        {driver.isFeatured && (
          <div className="absolute top-3 left-3 bg-[#0B1F3D]/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Availability dot — top-right floating */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-md">
          <span
            className={`w-2 h-2 rounded-full ${
              driver.availabilityStatus === 'AVAILABLE'
                ? 'bg-green-500 animate-pulse'
                : driver.availabilityStatus === 'BUSY'
                  ? 'bg-amber-500'
                  : 'bg-gray-400'
            }`}
          />
          <span className="text-xs font-bold text-gray-700">
            {driver.availabilityStatus === 'AVAILABLE'
              ? 'Available'
              : driver.availabilityStatus === 'BUSY'
                ? 'Busy'
                : 'Offline'}
          </span>
        </div>

        {/* Driver avatar — bottom-left floating over image */}
        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-50">
          {driver.profileImageUrl ? (
            <Image
              src={driver.profileImageUrl}
              alt={driver.displayName}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#0B1F3D] text-sm font-black bg-white">
              {driver.displayName.charAt(0)}
            </div>
          )}
        </div>
      </Link>

      {/* ── Content Section ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title + rating + location */}
        <Link href={`/drivers/${driver.slug}`} className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[#0B1F3D] transition-colors leading-tight">
              {driver.displayName}
            </h3>
            {driver.rating !== null && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-900">{driver.rating.toFixed(1)}</span>
                <span className="text-[10px] text-gray-400">({driver.reviewCount})</span>
              </div>
            )}
            {driver.rating === null && driver.reviewCount > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-500">New</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium">{cityName}{stateCode && `, ${stateCode}`}</span>
          </div>
        </Link>

        {/* Quick facts — compact single-line rows */}
        <div className="space-y-1.5 mb-3 flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Car className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium">
              {vehicleLabel}
              {driver.passengerCapacity && (
                <span className="text-gray-400"> · {driver.passengerCapacity} seats</span>
              )}
            </span>
          </div>

          {/* Amenity pills — compact, with SVG icons */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topAmenities.map((a) => {
                const label = AMENITY_LABELS.get(a) || a
                const Icon = AMENITY_ICONS[a]
                return (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-medium rounded-md"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {label}
                  </span>
                )
              })}
              {driver.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 text-gray-400 text-[11px] font-medium">
                  +{driver.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contact actions — sticky bottom */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
          <a
            href={phoneLink}
            className="inline-flex items-center justify-center gap-1 px-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
            aria-label={`Call ${driver.displayName}`}
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors"
            aria-label={`WhatsApp ${driver.displayName}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <Link
            href={`/drivers/${driver.slug}`}
            className="inline-flex items-center justify-center gap-1 px-1 py-2 bg-[#0B1F3D] hover:bg-[#001F3F] text-white rounded-lg text-xs font-bold transition-colors group/btn"
          >
            View
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
