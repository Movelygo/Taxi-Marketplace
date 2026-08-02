import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { AdminService } from '@/modules/admin/services/admin.service'
import { ProfileCompletenessService } from '@/modules/drivers/services/profile-completeness.service'
import { ProfileCompletenessCard } from '@/components/dashboard/profile-completeness-card'
import Link from 'next/link'
import { DriverStatus } from '@prisma/client'
import Image from 'next/image'
import { DriverFilters } from '@/components/admin/driver-filters'

export const metadata = {
  title: 'Driver Management | Movely Admin',
  description: 'Manage operational logistics and driver performance'
}

export const dynamic = 'force-dynamic'

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
  
  const totalDrivers = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  const activeDrivers = statusCounts.APPROVED || 0
  const pendingApproval = statusCounts.PENDING || 0
  const featuredDrivers = drivers.filter(d => d.isFeatured).length
  const flaggedIssues = (statusCounts.REJECTED || 0) + (statusCounts.SUSPENDED || 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">Manage operational logistics and driver performance metrics across the fleet</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Drivers */}
          <div className="bg-[#0B1F3D] text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-20">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">LIVE</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">Active Drivers</p>
            <h3 className="text-2xl font-bold mt-2">{activeDrivers.toLocaleString()}</h3>
          </div>

          {/* Pending Approval */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pending Approval</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">{pendingApproval}</h3>
          </div>

          {/* Featured Drivers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Featured Drivers</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">{featuredDrivers}</h3>
          </div>

          {/* Flagged Issues */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
            <p className="text-xs font-medium text-red-800 uppercase tracking-wide">Flagged Issues</p>
            <h3 className="text-2xl font-bold text-red-900 mt-2">{String(flaggedIssues).padStart(2, '0')}</h3>
          </div>
        </div>

        {/* Search and Filters */}
        <DriverFilters statusFilter={statusFilter} />

        {/* Drivers Table */}
        {drivers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500">No drivers found{statusFilter ? ` with status: ${statusFilter}` : ''}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Driver Identity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[180px]">
                    Quality
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                          {driver.profileImageUrl ? (
                            <Image
                              src={driver.profileImageUrl}
                              alt={driver.displayName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{driver.displayName}</p>
                          <p className="text-xs text-gray-500">{driver.vehicleType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{driver.city}</p>
                      <p className="text-xs text-gray-500">Since {new Date(driver.createdAt).getFullYear()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          driver.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          driver.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          driver.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          driver.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.status === 'APPROVED' ? 'ACTIVE' : driver.status}
                        </span>
                        {driver.status === 'APPROVED' && (
                          <p className="text-xs text-gray-500">Active since {new Date(driver.updatedAt).getFullYear()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <ProfileCompletenessCard
                          completeness={ProfileCompletenessService.evaluate(driver)}
                          compact
                        />
                        {!driver.profileImageUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No photo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          driver.isFeatured 
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={driver.isFeatured ? 'Featured' : 'Not Featured'}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/drivers/${driver.slug}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-[#0B1F3D] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Public Profile"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/drivers/${driver.id}`}
                          className="p-2 text-gray-600 hover:text-[#0B1F3D] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Driver"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {drivers.length} of {totalDrivers} driver{totalDrivers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
