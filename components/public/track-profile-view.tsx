'use client'

import { useEffect } from 'react'
import { trackProfileView } from '@/modules/profile-views/actions/track-view'

interface TrackProfileViewProps {
  driverId: string
}

export function TrackProfileView({ driverId }: TrackProfileViewProps) {
  useEffect(() => {
    trackProfileView(driverId)
  }, [driverId])

  return null
}
