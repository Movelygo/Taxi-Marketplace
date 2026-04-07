'use server'

import { ProfileViewService } from '../services/profile-view.service'
import { headers } from 'next/headers'

export async function trackProfileView(driverId: string) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined
    const userAgent = headersList.get('user-agent') || undefined
    const referrer = headersList.get('referer') || undefined

    const result = await ProfileViewService.trackView({
      driverId,
      ip,
      userAgent,
      referrer,
    })

    return { success: true, counted: result.counted }
  } catch (error) {
    console.error('Track profile view error:', error)
    return { error: 'Failed to track view', counted: false }
  }
}
