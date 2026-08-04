import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { ReportService } from '@/modules/reports/services/report.service'
import { ReportStatusActions } from '@/components/admin/report-actions'
import Link from 'next/link'
import { Flag } from '@/components/ui/icons'
import { format } from 'date-fns'

export const metadata = { title: 'Report Detail | Movely Admin' }
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const REASON_LABELS: Record<string, string> = {
  NOT_A_REAL_DRIVER: 'Not a real driver',
  SAFETY_CONCERN: 'Safety concern',
  MISLEADING_PROFILE: 'Misleading profile',
  INAPPROPRIATE_CONDUCT: 'Inappropriate conduct',
  OTHER: 'Other',
}

const PRIORITY: Record<string, { label: string; color: string }> = {
  SAFETY_CONCERN: { label: 'Critical', color: 'text-red-600 bg-red-50' },
  INAPPROPRIATE_CONDUCT: { label: 'Critical', color: 'text-red-600 bg-red-50' },
  NOT_A_REAL_DRIVER: { label: 'High', color: 'text-amber-600 bg-amber-50' },
  MISLEADING_PROFILE: { label: 'Medium', color: 'text-blue-600 bg-blue-50' },
  OTHER: { label: 'Low', color: 'text-gray-600 bg-gray-50' },
}

export default async function AdminReportDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params
  const report = await ReportService.getById(id)

  if (!report) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Report not found.</p>
        <Link href="/admin/reports" className="text-[#0B1F3D] hover:underline mt-2 inline-block">
          ← Back to reports
        </Link>
      </div>
    )
  }

  const priority = PRIORITY[report.reason] || PRIORITY.OTHER

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <Link href="/admin/reports" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Back to reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Report detail</h1>
        </div>
      </div>

      <div className="p-8 max-w-3xl space-y-6">
        {/* Report content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="font-bold text-gray-900">{REASON_LABELS[report.reason] || report.reason}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
              {report.reporterEmail && (
                <p className="text-xs text-gray-500 mt-1">From: {report.reporterEmail}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${priority.color}`}>
              {priority.label}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{report.details}</p>

          {report.adminNotes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Admin notes</div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{report.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Driver info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Reported driver</h3>
          <Link href={`/drivers/${report.driver.slug}`} className="text-[#0B1F3D] font-bold hover:underline">
            {report.driver.displayName}
          </Link>
          <p className="text-xs text-gray-500 mt-1 capitalize">Status: {report.driver.status.toLowerCase()}</p>
          <Link
            href={`/admin/drivers/${report.driver.id}`}
            className="text-sm text-[#0B1F3D] hover:underline mt-2 inline-block"
          >
            View in admin →
          </Link>
        </div>

        {/* Admin actions */}
        {report.status === 'NEW' || report.status === 'REVIEWED' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Resolution</h3>
            <ReportStatusActions reportId={report.id} currentStatus={report.status} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
            <p className="text-sm text-gray-700 capitalize">{report.status.replace('_', ' ').toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
