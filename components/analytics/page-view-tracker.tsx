'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/posthog-client'

interface PageViewTrackerProps {
  eventName: string
  properties?: Record<string, unknown>
}

export function PageViewTracker({ eventName, properties }: PageViewTrackerProps) {
  useEffect(() => {
    trackEvent(eventName, properties)
  }, [eventName, properties])

  return null
}
