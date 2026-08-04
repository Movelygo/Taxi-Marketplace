import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { ReportService } from '@/modules/reports/services/report.service'
import Link from 'next/link'
import type { ReportStatus } from '@prisma/client'
import { Flag } from '@/components/ui/icons'

export const metadata = {
  title: 'Reports | Movely Admin',
  description: 'Manage profile reports',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: ReportStatus; page?: string }>
}

const STATUS_TABS: { label: string; value?: ReportStatus }[] = [
  { label: 'All' },
  { label: 'New', value: 'NEW' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Dismissed', value: 'DISMISSED' },
  { label: 'Action taken', value: 'ACTION_TAKEN' },
]

const REASON_LABELS: Record<string, string> = {
  NOT_A_REAL_DRIVER: 'Not a real driver',
  SAFETY_CONCERN: 'Safety concern',
  MISLEADING_PROFILE: 'Misleading profile',
  INAPPROPRIATE_CONDUCT: 'Inappropriate conduct',
  OTHER: 'Other',
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<string, string> = {
    NEW: 'bg-red-100 text-red-800',
    REVIEWED: 'bg-blue-100 text-blue-800',
    DISMISSED: 'bg-gray-100 text-gray-600',
    ACTION_TAKEN: 'bg-green-100 text-green-800',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const params = await searchParams
  const statusFilter = params.status
  const page = Number(params.page || 1)

  const { reports, total } = await ReportService.getAllForAdmin({
    status: statusFilter,
    page,
    pageSize: 20,
  })

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            {total} report{total === 1 ? '' : 's'}
            {statusFilter ? ` (${statusFilter.replace('_', ' ')})` : ''}
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value || 'all'}
              href={tab.value ? `/admin/reports?status=${tab.value}` : '/admin/reports'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value || (!statusFilter && !tab.value)
                  ? 'bg-[#0B1F3D] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500">No reports found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {REASON_LABELS[report.reason] || report.reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/drivers/${report.driver.slug}`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                      >
                        {report.driver.displayName}
                      </Link>
                      <p className="text-xs text-gray-500 capitalize">{report.driver.status.toLowerCase()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="text-sm font-medium text-[#0B1F3D] hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/reports?${statusFilter ? `status=${statusFilter}&` : ''}page=${p}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  p === page ? 'bg-[#0B1F3D] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
