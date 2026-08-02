'use client'

import { useState } from 'react'
import { updateInquiryStatus } from '@/modules/contact/actions/update-inquiry-status'
import { Button } from '@/components/ui/button'
import { InquiryStatus } from '@prisma/client'
import { trackEvent } from '@/lib/analytics/posthog-client'

interface InquiryStatusActionsProps {
  inquiryId: string
  currentStatus: InquiryStatus
}

const nextStatuses: Record<InquiryStatus, InquiryStatus[]> = {
  NEW: ['IN_REVIEW', 'RESOLVED', 'ARCHIVED'],
  IN_REVIEW: ['NEW', 'RESOLVED', 'ARCHIVED'],
  RESOLVED: ['IN_REVIEW', 'ARCHIVED'],
  ARCHIVED: ['NEW'],
}

const labels: Record<InquiryStatus, string> = {
  NEW: 'New',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
  ARCHIVED: 'Archived',
}

export function InquiryStatusActions({ inquiryId, currentStatus }: InquiryStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    setLoading(true)
    setError(null)

    try {
      const result = await updateInquiryStatus(inquiryId, newStatus)
      if (result.error) {
        setError(result.error)
      } else {
        trackEvent('inquiry_status_changed', {
          inquiry_id: inquiryId,
          previous_status: currentStatus,
          new_status: newStatus,
        })
      }
    } catch (err) {
      console.error('[InquiryStatusActions] status change failed:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {nextStatuses[currentStatus].map((status) => (
          <Button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={loading}
            variant={status === 'ARCHIVED' ? 'outline' : 'default'}
            size="sm"
            className={status === 'RESOLVED' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Mark {labels[status]}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
