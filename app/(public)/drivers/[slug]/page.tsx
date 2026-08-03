import { DriverService } from '@/modules/drivers/services/driver.service'
import { GalleryService } from '@/modules/gallery/services/gallery.service'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getWhatsAppLink, getPhoneCallLink } from '@/lib/utils/phone'
import { TrackProfileView } from '@/components/public/track-profile-view'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { HeroCTAButtons } from '@/components/public/hero-cta-buttons'
import { ProfileGallery } from '@/components/public/profile-gallery'
import type { Metadata } from 'next'

interface DriverProfilePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DriverProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const driver = await DriverService.getPublicProfile(slug)

  if (!driver) {
    return {
      title: 'Driver Not Found | Movely',
    }
  }

  return {
    title: `${driver.displayName} - ${driver.city} Driver | Movely`,
    description: `${driver.displayName} offers ${driver.vehicleType} service in ${driver.city}. ${driver.serviceAreaText}. Book now!`,
    openGraph: {
      title: `${driver.displayName} - ${driver.city} Driver`,
      description: `${driver.vehicleType} service in ${driver.city}`,
      images: driver.profileImageUrl ? [driver.profileImageUrl] : [],
    },
  }
}

export default async function DriverProfilePage({ params }: DriverProfilePageProps) {
  const { slug } = await params
  const driver = await DriverService.getPublicProfile(slug)

  if (!driver) {
    notFound()
  }

  const photos = await GalleryService.getByDriverSlug(slug)

  const whatsappLink = getWhatsAppLink(driver.whatsappNumber, `Hi ${driver.displayName}, I found you on Movely and would like to book a ride.`)
  const phoneLink = getPhoneCallLink(driver.phone)

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackProfileView driverId={driver.id} />
      <PageViewTracker 
        eventName="public_driver_profile_viewed" 
        properties={{ driver_id: driver.id, driver_name: driver.displayName, city: driver.city }} 
      />
      
      {/* Hero — navy brand gradient, mobile-first layout */}
      <div className="relative bg-gradient-to-br from-[#0B1F3D] via-[#0B1F3D] to-[#001F3F]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Back Link */}
          <Link
            href="/drivers"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-6 sm:mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to directory
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            {/* Driver Info */}
            <div className="flex items-center sm:items-end gap-4 sm:gap-5 min-w-0">
              <div className="relative w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl flex-shrink-0">
                {driver.profileImageUrl ? (
                  <Image
                    src={driver.profileImageUrl}
                    alt={driver.displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-[#0B1F3D] font-bold bg-[#0B1F3D]/5">
                    {driver.displayName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 sm:pb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight truncate">
                  {driver.displayName}
                </h1>
                <p className="text-white/80 text-sm mt-1">{driver.vehicleType}</p>
                <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{driver.city}</span>
                </div>
              </div>
            </div>

            {/* CTAs — full-width on mobile, inline on sm+ */}
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <HeroCTAButtons
                driverId={driver.id}
                whatsappLink={whatsappLink}
                phoneLink={phoneLink}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Bio */}
            {driver.bio && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <div className="bg-white rounded-xl p-6">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{driver.bio}</p>
                </div>
              </section>
            )}

            {/* Vehicle Gallery — real photos if available */}
            {photos.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Photos</h2>
                <ProfileGallery photos={photos} driverName={driver.displayName} />
              </section>
            )}

            {/* Reviews placeholder — still honest, ships in Fase E */}
            <section className="space-y-3">
              <ComingSoonNote
                title="Customer reviews"
                description="Reviews from past customers will appear here."
              />
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Vehicle Info - Real Data */}
            <div className="bg-[#0B1F3D] rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-5">Vehicle Info</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/60 mb-1">Type</div>
                  <div className="font-semibold">{driver.vehicleType}</div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-white/60 mb-1">Service Area</div>
                  <div className="font-semibold text-sm">{driver.serviceAreaText}</div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-xs text-white/60 mb-1">Languages</div>
                  <div className="font-semibold">{driver.languages.join(', ')}</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-xs text-white/60 mb-2">PRICING</div>
                <p className="text-sm text-white/70">Contact driver directly to discuss rates.</p>
              </div>
            </div>

            {/* Availability — single compact card, no duplication with Vehicle Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Current availability</h3>
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    driver.availabilityStatus === 'AVAILABLE'
                      ? 'bg-green-500'
                      : driver.availabilityStatus === 'BUSY'
                        ? 'bg-amber-500'
                        : 'bg-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    driver.availabilityStatus === 'AVAILABLE'
                      ? 'text-green-700'
                      : driver.availabilityStatus === 'BUSY'
                        ? 'text-amber-700'
                        : 'text-gray-600'
                  }`}
                >
                  {driver.availabilityStatus === 'AVAILABLE'
                    ? 'Available now'
                    : driver.availabilityStatus === 'BUSY'
                      ? 'Currently busy'
                      : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Availability shown is what the driver last reported. Always confirm directly before travel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComingSoonNote({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl px-5 py-4 border border-gray-200 flex items-center gap-4">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Coming soon</span>
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}
