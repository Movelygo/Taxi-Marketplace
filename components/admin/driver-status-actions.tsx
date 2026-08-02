'use client'

import { useState } from 'react'
import { updateDriverStatus } from '@/modules/admin/actions/update-driver-status'
import { toggleFeatured } from '@/modules/admin/actions/toggle-featured'
import { Button } from '@/components/ui/button'
import { DriverStatus } from '@prisma/client'
import { trackEvent } from '@/lib/analytics/posthog-client'

interface DriverStatusActionsProps {
  driverId: string
  currentStatus: DriverStatus
  isFeatured: boolean
}

export function DriverStatusActions({ driverId, currentStatus, isFeatured }: DriverStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: DriverStatus) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateDriverStatus(driverId, newStatus)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Driver status updated to ${newStatus}`)
        trackEvent('driver_status_changed', {
          driver_id: driverId,
          previous_status: currentStatus,
          new_status: newStatus,
        })
      }
    } catch (err) {
      console.error('[DriverStatusActions] status change failed:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await toggleFeatured(driverId, !isFeatured)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Featured status ${!isFeatured ? 'enabled' : 'disabled'}`)
        trackEvent('driver_featured_toggled', {
          driver_id: driverId,
          featured: !isFeatured,
        })
      }
    } catch (err) {
      console.error('[DriverStatusActions] featured toggle failed:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {currentStatus !== 'APPROVED' && (
          <Button
            onClick={() => handleStatusChange('APPROVED')}
            disabled={loading}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
        )}

        {currentStatus !== 'REJECTED' && (
          <Button
            onClick={() => handleStatusChange('REJECTED')}
            disabled={loading}
            variant="destructive"
          >
            Reject
          </Button>
        )}

        {currentStatus !== 'SUSPENDED' && (
          <Button
            onClick={() => handleStatusChange('SUSPENDED')}
            disabled={loading}
            variant="outline"
            className="border-gray-400"
          >
            Suspend
          </Button>
        )}

        {currentStatus !== 'PENDING' && (
          <Button
            onClick={() => handleStatusChange('PENDING')}
            disabled={loading}
            variant="outline"
          >
            Set to Pending
          </Button>
        )}
      </div>

      <div>
        <Button
          onClick={handleToggleFeatured}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {isFeatured ? '★ Remove Featured' : '☆ Mark as Featured'}
        </Button>
      </div>

      {success && (
        <p className="text-sm text-green-600 font-medium">✓ {success}</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
