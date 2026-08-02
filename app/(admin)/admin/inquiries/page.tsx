import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { InquiryService } from '@/modules/contact/services/inquiry.service'
import { InquiryFilters } from '@/components/admin/inquiry-filters'
import { InquiryStatusBadge } from '@/components/admin/inquiry-status-badge'
import Link from 'next/link'
import { InquiryStatus } from '@prisma/client'

export const metadata = {
  title: 'Inquiries | Movely Admin',
  description: 'Manage contact form submissions',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: InquiryStatus }>
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  const params = await searchParams
  const statusFilter = params.status
  const inquiries = await InquiryService.getAll(statusFilter ? { status: statusFilter } : undefined)
  const statusCounts = await InquiryService.getStatusCounts()

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 mt-1">
            {total} total submission{total === 1 ? '' : 's'} across the platform
          </p>
        </div>
      </div>

      <div className="p-8">
        <InquiryFilters statusFilter={statusFilter} />

        {inquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500">
              No inquiries found
              {statusFilter ? ` with status: ${statusFilter.replace('_', ' ')}` : ''}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-xs text-gray-500">{inquiry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate" title={inquiry.subject}>
                        {inquiry.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <InquiryStatusBadge status={inquiry.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
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
      </div>
    </div>
  )
}
