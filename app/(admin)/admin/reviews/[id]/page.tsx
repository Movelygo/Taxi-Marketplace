import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { ReviewService } from '@/modules/reviews/services/review.service'
import { ApproveRejectButtons } from '@/components/admin/review-actions'
import { ResolveFlagButtons } from '@/components/admin/review-actions'
import Link from 'next/link'
import { Star, Flag, CheckCircle2 } from '@/components/ui/icons'
import { format } from 'date-fns'

export const metadata = { title: 'Review Detail | Movely Admin' }
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminReviewDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params
  const review = await ReviewService.getById(id)

  if (!review) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Review not found.</p>
        <Link href="/admin/reviews" className="text-[#0B1F3D] hover:underline mt-2 inline-block">
          ← Back to reviews
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <Link href="/admin/reviews" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Back to reviews
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Review detail</h1>
        </div>
      </div>

      <div className="p-8 max-w-3xl space-y-6">
        {/* Review content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{review.reviewerName}</span>
                {review.isVerifiedContact && (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified contact
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{review.reviewerEmail}</p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {format(new Date(review.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-black text-gray-900">{review.rating}</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.text}</p>

          {review.driverResponse && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-bold text-[#0B1F3D] uppercase tracking-wider mb-2">Driver response</div>
              <p className="text-sm text-gray-600 italic whitespace-pre-line">{review.driverResponse}</p>
              {review.driverRespondedAt && (
                <p className="text-xs text-gray-400 mt-2">{format(new Date(review.driverRespondedAt), 'MMM d, yyyy')}</p>
              )}
            </div>
          )}
        </div>

        {/* Driver info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Driver</h3>
          <Link href={`/drivers/${review.driver.slug}`} className="text-[#0B1F3D] font-bold hover:underline">
            {review.driver.displayName}
          </Link>
          <p className="text-xs text-gray-500 mt-1">{review.driver.user.email}</p>
        </div>

        {/* Flag / appeal info */}
        {review.isFlaggedByDriver && review.flagReason && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">Driver appeal</h3>
            </div>
            <p className="text-sm text-red-800 leading-relaxed whitespace-pre-line">{review.flagReason}</p>
            {review.flaggedAt && (
              <p className="text-xs text-red-500 mt-2">Flagged {format(new Date(review.flaggedAt), 'MMM d, yyyy')}</p>
            )}
            {review.flagStatus && review.flagStatus !== 'FLAG_PENDING' && (
              <p className="text-xs text-gray-500 mt-2">
                Resolved: {review.flagStatus.replace('FLAG_', '')}
              </p>
            )}
          </div>
        )}

        {/* Admin actions */}
        {review.status === 'PENDING' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Moderation</h3>
            <ApproveRejectButtons reviewId={review.id} />
          </div>
        )}

        {/* Flag resolution */}
        {review.isFlaggedByDriver && review.flagStatus === 'FLAG_PENDING' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Resolve appeal</h3>
            <p className="text-sm text-gray-500 mb-4">
              Dismiss = review stays published. Remove = review is rejected and removed from public view.
            </p>
            <ResolveFlagButtons reviewId={review.id} />
          </div>
        )}
      </div>
    </div>
  )
}
