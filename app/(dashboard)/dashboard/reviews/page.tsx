import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { ReviewService } from '@/modules/reviews/services/review.service'
import { DriverReviewsList } from '@/components/dashboard/driver-reviews-list'
import { Star } from '@/components/ui/icons'

export const metadata = { title: 'Reviews | Movely Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardReviewsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const driver = await DriverService.getProfile(user.id)
  if (!driver) {
    redirect('/dashboard/profile')
  }

  const reviews = await ReviewService.getByDriverForDriver(driver.id)
  const ratingSummary = await ReviewService.getRatingSummary(driver.id)

  const approvedReviews = reviews.filter((r) => r.status === 'APPROVED')
  const pendingReviews = reviews.filter((r) => r.status === 'PENDING')
  const rejectedReviews = reviews.filter((r) => r.status === 'REJECTED')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          See what customers are saying about your service
        </p>
      </div>

      {/* Rating summary card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">
              {ratingSummary.count >= 3 ? ratingSummary.average.toFixed(1) : '—'}
            </div>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(ratingSummary.average) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingSummary.distribution.map((d) => (
              <div key={d.rating} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 w-3">{d.rating}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${ratingSummary.count > 0 ? (d.count / ratingSummary.count) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status counts */}
      {(pendingReviews.length > 0 || rejectedReviews.length > 0) && (
        <div className="flex gap-3 mb-6">
          {pendingReviews.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-bold text-amber-800">
                {pendingReviews.length} pending moderation
              </span>
            </div>
          )}
          {rejectedReviews.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-bold text-red-800">
                {rejectedReviews.length} rejected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Reviews list (client component for respond/flag actions) */}
      <DriverReviewsList reviews={approvedReviews} />

      {approvedReviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-900 text-lg mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Reviews from customers will appear here once they are submitted and approved by our moderation team.
          </p>
        </div>
      )}
    </div>
  )
}
