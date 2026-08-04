import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { ReviewService } from '@/modules/reviews/services/review.service'
import Link from 'next/link'
import type { ReviewStatus } from '@prisma/client'
import { Star, Flag, CheckCircle2 } from '@/components/ui/icons'

export const metadata = {
  title: 'Reviews | Movely Admin',
  description: 'Moderate driver reviews',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: ReviewStatus; flagged?: string; page?: string }>
}

const STATUS_TABS: { label: string; value?: ReviewStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
]

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  )
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  const params = await searchParams
  const statusFilter = params.status
  const flaggedOnly = params.flagged === 'true'
  const page = Number(params.page || 1)

  const { reviews, total } = await ReviewService.getAllForAdmin({
    status: statusFilter,
    flaggedOnly,
    page,
    pageSize: 20,
  })

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">
            {total} review{total === 1 ? '' : 's'}
            {flaggedOnly ? ' (flagged by drivers)' : ''}
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/admin/reviews"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !statusFilter && !flaggedOnly ? 'bg-[#0B1F3D] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            All
          </Link>
          {STATUS_TABS.slice(1).map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/reviews?status=${tab.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value && !flaggedOnly ? 'bg-[#0B1F3D] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <Link
            href="/admin/reviews?flagged=true"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              flaggedOnly ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Flagged appeals
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500">No reviews found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reviewer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          {review.reviewerName}
                          {review.isVerifiedContact && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{review.reviewerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/drivers/${review.driver.slug}`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                      >
                        {review.driver.displayName}
                      </Link>
                      {review.isFlaggedByDriver && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                          <Flag className="w-3 h-3" />
                          Driver flagged
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-gray-900">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/reviews/${review.id}`}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/reviews?${statusFilter ? `status=${statusFilter}&` : ''}${flaggedOnly ? 'flagged=true&' : ''}page=${p}`}
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
