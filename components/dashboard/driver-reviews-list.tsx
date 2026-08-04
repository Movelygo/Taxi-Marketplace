'use client'

import { useState } from 'react'
import { respondToReview, flagReview } from '@/modules/reviews/actions/driver-review-actions'
import { Star, Flag, CheckCircle2 } from '@/components/ui/icons'
import { format } from 'date-fns'
import type { Review } from '@prisma/client'

export function DriverReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <DriverReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}

function DriverReviewCard({ review }: { review: Review }) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [responseText, setResponseText] = useState(review.driverResponse || '')
  const [flagReason, setFlagReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')

  const hasResponse = !!review.driverResponse
  const isFlagged = review.isFlaggedByDriver

  const handleResponse = async () => {
    if (responseText.trim().length < 10) return
    setStatus('submitting')
    const formData = new FormData()
    formData.append('reviewId', review.id)
    formData.append('response', responseText)
    await respondToReview({ status: 'idle' }, formData)
    setStatus('done')
    setShowResponseForm(false)
  }

  const handleFlag = async () => {
    if (flagReason.trim().length < 10) return
    setStatus('submitting')
    const formData = new FormData()
    formData.append('reviewId', review.id)
    formData.append('reason', flagReason)
    await flagReview({ status: 'idle' }, formData)
    setStatus('done')
    setShowFlagForm(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
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
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-gray-900">{review.rating}</span>
        </div>
      </div>

      {/* Review text */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{review.text}</p>

      {/* Existing response */}
      {hasResponse && !showResponseForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs font-bold text-[#0B1F3D] uppercase tracking-wider mb-1">Your response</div>
          <p className="text-sm text-gray-600 italic whitespace-pre-line">{review.driverResponse}</p>
        </div>
      )}

      {/* Flag status */}
      {isFlagged && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <Flag className="w-3.5 h-3.5" />
            You flagged this review — pending admin review
          </div>
        </div>
      )}

      {/* Actions */}
      {!isFlagged && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
          {!hasResponse && (
            <button
              onClick={() => setShowResponseForm(!showResponseForm)}
              className="text-sm font-bold text-[#0B1F3D] hover:underline"
            >
              {showResponseForm ? 'Cancel' : 'Respond publicly'}
            </button>
          )}
          <button
            onClick={() => setShowFlagForm(!showFlagForm)}
            className="text-sm font-bold text-gray-400 hover:text-red-500 flex items-center gap-1"
          >
            <Flag className="w-3.5 h-3.5" />
            {showFlagForm ? 'Cancel' : 'Flag as unfair'}
          </button>
        </div>
      )}

      {/* Response form */}
      {showResponseForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Your public response
          </label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={3}
            placeholder="Respond professionally. Future customers will read this."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]/10 focus:border-[#0B1F3D] resize-none"
          />
          <button
            onClick={handleResponse}
            disabled={status === 'submitting' || responseText.trim().length < 10}
            className="mt-2 px-6 py-2.5 bg-[#0B1F3D] text-white rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting…' : 'Publish response'}
          </button>
        </div>
      )}

      {/* Flag form */}
      {showFlagForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Why is this review unfair?
          </label>
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            rows={3}
            placeholder="Explain why you believe this review is inaccurate, fake, or violates our policies. Our team will review your appeal."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 resize-none"
          />
          <button
            onClick={handleFlag}
            disabled={status === 'submitting' || flagReason.trim().length < 10}
            className="mt-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit appeal'}
          </button>
        </div>
      )}

      {status === 'done' && (
        <div className="mt-3 text-sm text-green-600 font-bold">
          ✓ Submitted successfully
        </div>
      )}
    </div>
  )
}
