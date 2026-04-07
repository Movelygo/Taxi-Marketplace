import { DriverService } from '@/modules/drivers/services/driver.service'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWhatsAppLink, getPhoneCallLink } from '@/lib/utils/phone'
import { TrackProfileView } from '@/components/public/track-profile-view'
import { LeadTrackingButtons } from '@/components/public/lead-tracking-buttons'
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

  const whatsappLink = getWhatsAppLink(driver.whatsappNumber, `Hi ${driver.displayName}, I found you on Movely and would like to book a ride.`)
  const phoneLink = getPhoneCallLink(driver.phone)

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackProfileView driverId={driver.id} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/drivers" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to drivers
          </Link>
        </div>

        <Card>
          <CardHeader>
            {driver.profileImageUrl && (
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={driver.profileImageUrl}
                    alt={driver.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <CardTitle className="text-3xl text-center">{driver.displayName}</CardTitle>
            <CardDescription className="text-center text-lg">{driver.city}</CardDescription>
            <div className="flex justify-center mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                driver.availabilityStatus === 'AVAILABLE'
                  ? 'bg-green-100 text-green-800'
                  : driver.availabilityStatus === 'BUSY'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {driver.availabilityStatus}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Vehicle Type</h3>
                <p className="text-gray-700">{driver.vehicleType}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
                <p className="text-gray-700">{driver.languages.join(', ')}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Service Area</h3>
              <p className="text-gray-700">{driver.serviceAreaText}</p>
            </div>

            {driver.bio && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-700 whitespace-pre-line">{driver.bio}</p>
              </div>
            )}

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-4 text-center">Contact {driver.displayName}</h3>
              <LeadTrackingButtons 
                driverId={driver.id}
                whatsappLink={whatsappLink}
                phoneLink={phoneLink}
                driverName={driver.displayName}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
