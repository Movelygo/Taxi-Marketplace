import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { AdminService } from '@/modules/admin/services/admin.service'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { DriverStatusActions } from '@/components/admin/driver-status-actions'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { ProfileCompletenessCard } from '@/components/dashboard/profile-completeness-card'
import { ProfileCompletenessService } from '@/modules/drivers/services/profile-completeness.service'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const driver = await AdminService.getDriverById(id)

  return {
    title: driver ? `${driver.displayName} - Driver Review | Admin` : 'Driver Not Found',
  }
}

export default async function AdminDriverDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { id } = await params
  const driver = await AdminService.getDriverById(id)

  if (!driver) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <PageViewTracker 
        eventName="admin_driver_reviewed" 
        properties={{ driver_id: driver.id, status: driver.status, is_featured: driver.isFeatured }} 
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link 
                  href="/admin/drivers"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Driver List"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{driver.displayName}</h1>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                  driver.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  driver.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  driver.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  driver.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {driver.status}
                </span>
              </div>
              <p className="text-gray-600">@{driver.slug}</p>
            </div>
            {driver.status === 'APPROVED' && (
              <Link 
                href={`/drivers/${driver.slug}`} 
                target="_blank"
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                View Public Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Image */}
            {driver.profileImageUrl && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-center">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                    <Image
                      src={driver.profileImageUrl}
                      alt={driver.displayName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-sm text-gray-900">{driver.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">WhatsApp</p>
                    <p className="text-sm text-gray-900">{driver.whatsappNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">City</p>
                    <p className="text-sm text-gray-900">{driver.city}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Vehicle Type</p>
                    <p className="text-sm text-gray-900">{driver.vehicleType}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Service Area</p>
                    <p className="text-sm text-gray-900">{driver.serviceAreaText}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Languages</p>
                    <p className="text-sm text-gray-900">{driver.languages.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {driver.bio && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Bio</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{driver.bio}</p>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Additional Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Availability Status</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      driver.availabilityStatus === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      driver.availabilityStatus === 'BUSY' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.availabilityStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Featured Driver</p>
                    <div className="flex items-center gap-2">
                      {driver.isFeatured ? (
                        <>
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">Yes</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-900">No</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Profile Created</p>
                    <p className="text-sm text-gray-900">{new Date(driver.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">{new Date(driver.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">{new Date(driver.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">{new Date(driver.updatedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCompletenessCard
              completeness={ProfileCompletenessService.evaluate(driver)}
            />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Admin Actions</h2>
                <p className="text-sm text-gray-600 mt-1">Manage driver status and visibility</p>
              </div>
              <div className="p-6">
                <DriverStatusActions
                  driverId={driver.id}
                  currentStatus={driver.status}
                  isFeatured={driver.isFeatured}
                />

                {driver.status !== 'APPROVED' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Public Profile</p>
                    <p className="text-xs text-gray-500">
                      Profile is not public (status: {driver.status})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
