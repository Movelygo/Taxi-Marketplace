import { DriverService } from '@/modules/drivers/services/driver.service'
import { GalleryService } from '@/modules/gallery/services/gallery.service'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getWhatsAppLink, getPhoneCallLink } from '@/lib/utils/phone'
import { TrackProfileView } from '@/components/public/track-profile-view'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { ProfileGallery } from '@/components/public/profile-gallery'
import { 
  MapPin, 
  Car, 
  Languages, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AMENITY_ICONS, 
  PAYMENT_ICONS,
  Phone,
  MessageCircle,
  Info,
  Star,
  ShieldCheck,
  User
} from '@/components/ui/icons'
import { DEFAULT_AMENITIES, DEFAULT_PAYMENT_METHODS } from '@/modules/drivers/constants/profile-attributes'
import type { Metadata } from 'next'
import { format } from 'date-fns'

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

function SectionTitle({ title, icon: Icon }: { title: string, icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-5 h-5 text-[#0B1F3D]" />}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  )
}

function InfoCard({ label, value, icon: Icon }: { label: string, value: string | number | null, icon: any }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 text-gray-600">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
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

  // Mapping for display labels
  const typedDriver = driver as any // Temporary escape for included relations
  const amenityMap: Map<string, string> = new Map(DEFAULT_AMENITIES.map(a => [a.key, a.label] as [string, string]))
  const paymentMap: Map<string, string> = new Map(DEFAULT_PAYMENT_METHODS.map(p => [p.key, p.label] as [string, string]))

  const vehicleName = [driver.vehicleMake, driver.vehicleModel, driver.vehicleYear].filter(Boolean).join(' ') || driver.vehicleType

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 lg:pb-0">
      <TrackProfileView driverId={driver.id} />
      <PageViewTracker 
        eventName="public_driver_profile_viewed" 
        properties={{ driver_id: driver.id, driver_name: driver.displayName, city: driver.city }} 
      />
      
      {/* Top Navigation Bar (Mobile & Desktop) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/drivers" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to directory</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {driver.availabilityStatus === 'AVAILABLE' ? 'AVAILABLE NOW' : driver.availabilityStatus}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8 lg:space-y-10">
            
            {/* Header / Identity Block */}
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white bg-white shadow-xl flex-shrink-0">
                {driver.profileImageUrl ? (
                  <Image src={driver.profileImageUrl} alt={driver.displayName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#0B1F3D] font-bold bg-gray-50">
                    {driver.displayName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                    {driver.displayName}
                  </h1>
                  <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 mt-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {typedDriver.cityRel?.name || driver.city}, {typedDriver.cityRel?.state || ''}
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Member since {format(new Date(driver.createdAt), 'MMM yyyy')}
                  </div>
                </div>

                {/* Tags / Badges Row */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <span className="px-3 py-1 bg-[#0B1F3D] text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                    {driver.vehicleType}
                  </span>
                  {driver.isFeatured && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <InfoCard label="Vehicle" value={vehicleName} icon={Car} />
              <InfoCard label="Capacity" value={driver.passengerCapacity ? `${driver.passengerCapacity} passengers` : '4 passengers'} icon={User} />
              <InfoCard label="Languages" value={driver.languages.join(', ')} icon={Languages} />
              <InfoCard label="Response" value="< 15 min" icon={Clock} />
            </div>

            {/* Gallery — Primary position */}
            {photos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle title="Vehicle Gallery" icon={Car} />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{photos.length} Photos</span>
                </div>
                <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                  <ProfileGallery photos={photos} driverName={driver.displayName} />
                </div>
              </section>
            )}

            {/* About / Bio */}
            {driver.bio && (
              <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <SectionTitle title="About" icon={Info} />
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg italic font-medium opacity-90">
                  "{driver.bio}"
                </p>
              </section>
            )}

            {/* Amenities & Services */}
            {driver.amenities.length > 0 && (
              <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <SectionTitle title="Amenities & Services" icon={CheckCircle2} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {driver.amenities.map(key => {
                    const Icon = AMENITY_ICONS[key] || CheckCircle2
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="p-2 rounded-xl bg-white text-[#0B1F3D] shadow-sm">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{amenityMap.get(key) || key}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Payment Methods */}
            {driver.paymentMethods.length > 0 && (
              <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <SectionTitle title="Payment Methods" icon={CheckCircle2} />
                <div className="flex flex-wrap gap-3">
                  {driver.paymentMethods.map(key => {
                    const Icon = PAYMENT_ICONS[key] || CheckCircle2
                    return (
                      <div key={key} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-700">{paymentMap.get(key) || key}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* Contact Card (Desktop) */}
              <div className="hidden lg:block bg-[#0B1F3D] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                
                <h3 className="text-2xl font-bold mb-2">Book this ride</h3>
                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                  Contact {driver.displayName.split(' ')[0]} directly to discuss your trip and get a quote.
                </p>
                
                <div className="space-y-3">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-lg transition-all transform active:scale-[0.98] shadow-lg shadow-green-500/20"
                  >
                    <MessageCircle className="w-6 h-6" />
                    WhatsApp
                  </a>
                  <a
                    href={phoneLink}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-lg transition-all transform active:scale-[0.98] border border-white/10"
                  >
                    <Phone className="w-6 h-6" />
                    Call Now
                  </a>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/40 tracking-widest uppercase">
                  <span>Direct contact</span>
                  <span>No fees</span>
                </div>
              </div>

              {/* Service Area Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <SectionTitle title="Service Area" icon={MapPin} />
                <p className="text-gray-700 font-semibold leading-relaxed mb-4">
                  {driver.serviceAreaText}
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                  <span>Based in {typedDriver.cityRel?.name || driver.city}</span>
                </div>
              </div>

              {/* Hours / Schedule */}
              {driver.operatingHours && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <SectionTitle title="Operating Hours" icon={Clock} />
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-gray-700">{driver.operatingHours}</span>
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-500 text-white shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-blue-900 uppercase tracking-tight">Trust & Safety</h3>
                </div>
                <p className="text-blue-900/70 text-sm leading-relaxed font-medium">
                  Movely connects you directly with drivers. Always verify credentials and discuss safety before your trip.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-40">
        <div className="flex gap-3 max-w-lg mx-auto">
          <a
            href={phoneLink}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black transition-all active:scale-[0.98]"
          >
            <Phone className="w-5 h-5" />
            Call
          </a>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[2] flex items-center justify-center gap-2 py-4 bg-[#0B1F3D] text-white rounded-2xl font-black transition-all active:scale-[0.98] shadow-xl shadow-[#0B1F3D]/20"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>

    </div>
  )
}
