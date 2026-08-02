import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect, notFound } from 'next/navigation'
import { InquiryService } from '@/modules/contact/services/inquiry.service'
import { InquiryStatusBadge } from '@/components/admin/inquiry-status-badge'
import { InquiryStatusActions } from '@/components/admin/inquiry-status-actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params
  const inquiry = await InquiryService.getById(id)

  if (!inquiry) {
    notFound()
  }

  const receivedAt = new Date(inquiry.createdAt).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/inquiries"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Inquiries"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{inquiry.subject}</h1>
            <InquiryStatusBadge status={inquiry.status} />
          </div>
          <p className="text-gray-600">From {inquiry.name} on {receivedAt}</p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Message</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {inquiry.message}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</p>
                  <p className="text-gray-900">{inquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</p>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-[#0B1F3D] font-medium hover:underline break-all"
                  >
                    {inquiry.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Received</p>
                  <p className="text-gray-900">{receivedAt}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
              <InquiryStatusActions inquiryId={inquiry.id} currentStatus={inquiry.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
