'use client'

import { useTransition } from 'react'
import { approveReview, rejectReview, resolveFlag } from '@/modules/reviews/actions/admin-review-actions'
import { useRouter } from 'next/navigation'

export function ApproveRejectButtons({ reviewId }: { reviewId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleApprove = () => {
    startTransition(async () => {
      await approveReview(reviewId)
      router.refresh()
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await rejectReview(reviewId)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleApprove}
        disabled={pending}
        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        Approve & publish
      </button>
      <button
        onClick={handleReject}
        disabled={pending}
        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}

export function ResolveFlagButtons({ reviewId }: { reviewId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleDismiss = () => {
    startTransition(async () => {
      await resolveFlag(reviewId, 'FLAG_DISMISSED')
      router.refresh()
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      await resolveFlag(reviewId, 'FLAG_REMOVED')
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDismiss}
        disabled={pending}
        className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
      >
        Dismiss — keep review
      </button>
      <button
        onClick={handleRemove}
        disabled={pending}
        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        Remove review
      </button>
    </div>
  )
}
