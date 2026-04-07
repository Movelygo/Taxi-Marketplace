import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { AdminService } from '@/modules/admin/services/admin.service'
import { StatusBadge } from '@/components/admin/status-badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DriverStatus } from '@prisma/client'

export const metadata = {
  title: 'Driver Management | Admin',
  description: 'Review and manage driver profiles'
}

interface PageProps {
  searchParams: Promise<{ status?: DriverStatus }>
}

export default async function AdminDriversPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const statusFilter = params.status

  const drivers = await AdminService.getAllDrivers(statusFilter)
  const statusCounts = await AdminService.getStatusCounts()

  const statuses: DriverStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="outline">← Back to Admin</Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <p className="text-gray-600 mt-2">Review and manage driver profiles</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/drivers">
          <Button variant={!statusFilter ? 'default' : 'outline'}>
            All ({drivers.length})
          </Button>
        </Link>
        {statuses.map((status) => (
          <Link key={status} href={`/admin/drivers?status=${status}`}>
            <Button variant={statusFilter === status ? 'default' : 'outline'}>
              {status} ({statusCounts[status]})
            </Button>
          </Link>
        ))}
      </div>

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No drivers found{statusFilter ? ` with status: ${statusFilter}` : ''}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {driver.displayName}
                          {driver.isFeatured && <span className="ml-2 text-yellow-500">★</span>}
                        </div>
                        <div className="text-sm text-gray-500">{driver.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.vehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={driver.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(driver.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/drivers/${driver.id}`}>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
