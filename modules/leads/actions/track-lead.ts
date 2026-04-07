'use server'

import { LeadService } from '../services/lead.service'
import { LeadSource } from '@prisma/client'
import { headers } from 'next/headers'

export async function trackLead(driverId: string, source: LeadSource) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined
    const userAgent = headersList.get('user-agent') || undefined
    const referrer = headersList.get('referer') || undefined

    await LeadService.trackLead({
      driverId,
      source,
      ip,
      userAgent,
      referrer,
    })

    return { success: true }
  } catch (error) {
    console.error('Track lead error:', error)
    return { error: 'Failed to track lead' }
  }
}
