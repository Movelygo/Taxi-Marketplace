import type { DriverStatus, AvailabilityStatus } from '@prisma/client'

export function formatDriverStatus(status: DriverStatus): {
  label: string
  description: string
  tone: 'positive' | 'pending' | 'negative' | 'neutral'
} {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved',
        description: 'Your profile is live in the public directory.',
        tone: 'positive',
      }
    case 'PENDING':
      return {
        label: 'Pending review',
        description: 'Our team is reviewing your profile. This usually takes 1–2 business days.',
        tone: 'pending',
      }
    case 'REJECTED':
      return {
        label: 'Rejected',
        description: 'Your profile was rejected. Please contact support for details.',
        tone: 'negative',
      }
    case 'SUSPENDED':
      return {
        label: 'Suspended',
        description: 'Your profile is currently suspended. Please contact support.',
        tone: 'negative',
      }
    default:
      return { label: status, description: '', tone: 'neutral' }
  }
}

export function formatAvailability(availability: AvailabilityStatus): {
  label: string
  tone: 'available' | 'busy' | 'offline'
} {
  switch (availability) {
    case 'AVAILABLE':
      return { label: 'Available', tone: 'available' }
    case 'BUSY':
      return { label: 'Busy', tone: 'busy' }
    case 'OFFLINE':
      return { label: 'Offline', tone: 'offline' }
    default:
      return { label: availability, tone: 'offline' }
  }
}
