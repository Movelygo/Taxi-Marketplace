'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitReview, type SubmitReviewState } from '@/modules/reviews/actions/submit-review'
import { Star } from '@/components/ui/icons'
import { useState } from 'react'

interface ReviewFormProps {
  driverId: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 bg-[#0B1F3D] text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting…' : 'Submit review'}
    </button>
  )
}

export function ReviewForm({ driverId }: ReviewFormProps) {
  const [state, formAction] = useFormState(submitReview, { status: 'idle' } as SubmitReviewState)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  if (state.status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="font-bold text-green-900 text-base mb-1">Review submitted</h4>
        <p className="text-sm text-green-700">
          Thank you! Your review will be visible after moderation (usually within 24 hours).
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="driverId" value={driverId} />

      {/* Star rating */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform active:scale-90"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hover || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
        {state.status === 'error' && state.fieldErrors?.rating && (
          <p className="text-xs text-red-500 mt-1">{state.fieldErrors.rating}</p>
        )}
      </div>

      {/* Review text */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your review
        </label>
        <textarea
          name="text"
          rows={4}
          placeholder="Share your experience — was the driver punctual, professional, safe?"
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]/10 focus:border-[#0B1F3D] resize-none"
        />
        {state.status === 'error' && state.fieldErrors?.text && (
          <p className="text-xs text-red-500 mt-1">{state.fieldErrors.text}</p>
        )}
      </div>

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Your name
          </label>
          <input
            type="text"
            name="reviewerName"
            placeholder="Jane D."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]/10 focus:border-[#0B1F3D]"
          />
          {state.status === 'error' && state.fieldErrors?.reviewerName && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.reviewerName}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            name="reviewerEmail"
            placeholder="jane@example.com"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]/10 focus:border-[#0B1F3D]"
          />
          {state.status === 'error' && state.fieldErrors?.reviewerEmail && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.reviewerEmail}</p>
          )}
        </div>
      </div>

      {state.status === 'error' && state.message && !state.fieldErrors && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.message}</p>
      )}
      {state.status === 'error' && state.message && state.fieldErrors && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <SubmitButton />

      <p className="text-xs text-gray-400 text-center">
        Reviews are moderated before publishing. We do not remove honest negative reviews.
      </p>
    </form>
  )
}
