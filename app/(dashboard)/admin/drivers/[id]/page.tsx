import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect, notFound } from 'next/navigation'
import { AdminService } from '@/modules/admin/services/admin.service'
import { StatusBadge } from '@/components/admin/status-badge'
import { DriverStatusActions } from '@/components/admin/driver-status-actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/drivers">
          <Button variant="outline">← Back to Driver List</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{driver.displayName}</CardTitle>
                  <CardDescription>@{driver.slug}</CardDescription>
                </div>
                <StatusBadge status={driver.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {driver.profileImageUrl && (
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={driver.profileImageUrl}
                      alt={driver.displayName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{driver.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                  <p className="text-sm text-gray-900">{driver.whatsappNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-sm text-gray-900">{driver.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                  <p className="text-sm text-gray-900">{driver.vehicleType}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Service Area</p>
                <p className="text-sm text-gray-900">{driver.serviceAreaText}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Languages</p>
                <p className="text-sm text-gray-900">{driver.languages.join(', ')}</p>
              </div>

              {driver.bio && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{driver.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-500">Availability</p>
                  <p className="text-sm text-gray-900">{driver.availabilityStatus}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Featured</p>
                  <p className="text-sm text-gray-900">{driver.isFeatured ? 'Yes ★' : 'No'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{new Date(driver.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated</p>
                  <p className="text-sm text-gray-900">{new Date(driver.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Manage driver status and visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <DriverStatusActions
                driverId={driver.id}
                currentStatus={driver.status}
                isFeatured={driver.isFeatured}
              />

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 mb-2">Public Profile</p>
                {driver.status === 'APPROVED' ? (
                  <Link href={`/drivers/${driver.slug}`} target="_blank">
                    <Button variant="outline" size="sm" className="w-full">
                      View Public Profile →
                    </Button>
                  </Link>
                ) : (
                  <p className="text-xs text-gray-500">
                    Profile not public (status: {driver.status})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
