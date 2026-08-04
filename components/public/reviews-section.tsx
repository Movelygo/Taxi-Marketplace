import { Star, CheckCircle2 } from '@/components/ui/icons'
import { format } from 'date-fns'
import type { Review } from '@prisma/client'

interface ReviewsSectionProps {
  reviews: Review[]
  ratingSummary: {
    average: number
    count: number
    distribution: { rating: number; count: number }[]
  }
  driverId: string
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${dim} ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">{review.reviewerName}</span>
            {review.isVerifiedContact && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Contacted
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {review.publishedAt ? format(new Date(review.publishedAt), 'MMM d, yyyy') : ''}
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{review.text}</p>

      {review.driverResponse && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#0B1F3D] uppercase tracking-wider">Driver response</span>
            {review.driverRespondedAt && (
              <span className="text-xs text-gray-400">{format(new Date(review.driverRespondedAt), 'MMM d, yyyy')}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed italic">{review.driverResponse}</p>
        </div>
      )}
    </div>
  )
}

export function ReviewsSection({ reviews, ratingSummary, driverId }: ReviewsSectionProps) {
  const { average, count, distribution } = ratingSummary
  const hasReviews = count > 0
  const showRating = count >= 3 // threshold per guidelines

  return (
    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <Star className="w-5 h-5 text-[#0B1F3D]" />
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Reviews</h2>
        {hasReviews && (
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-auto">
            {count} {count === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>

      {/* Rating summary */}
      {hasReviews ? (
        <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-100">
          {/* Score */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-start">
            <div className="text-4xl font-black text-gray-900">
              {showRating ? average.toFixed(1) : 'New'}
            </div>
            <div>
              <StarRow rating={Math.round(average)} size="md" />
              <div className="text-xs text-gray-400 mt-1">
                {showRating ? `Based on ${count} reviews` : `${count} review${count > 1 ? 's' : ''} so far`}
              </div>
            </div>
          </div>

          {/* Distribution histogram */}
          {showRating && (
            <div className="flex-1 space-y-1.5">
              {distribution.map((d) => (
                <div key={d.rating} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 w-3">{d.rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${count > 0 ? (d.count / count) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            No reviews yet. Be the first to share your experience with this driver.
          </p>
        </div>
      )}

      {/* Review list */}
      {hasReviews && (
        <div className="space-y-3 mb-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Review form */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-base mb-4">
          {hasReviews ? 'Write a review' : 'Write the first review'}
        </h3>
        <ReviewFormLazy driverId={driverId} />
      </div>
    </section>
  )
}

// Lazy load the form to keep the server component clean
import { ReviewForm } from './review-form'
function ReviewFormLazy({ driverId }: { driverId: string }) {
  return <ReviewForm driverId={driverId} />
}
