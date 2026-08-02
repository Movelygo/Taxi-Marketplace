'use client'

import posthog from 'posthog-js'

let isInitialized = false

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (isInitialized) return
  
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  
  if (!key) return
  
  posthog.init(key, {
    api_host: host || 'https://app.posthog.com',
    capture_pageview: false,
    autocapture: false,
    disable_session_recording: true,
  })
  
  isInitialized = true
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!isInitialized) return
  
  posthog.capture(eventName, properties)
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!isInitialized) return
  
  posthog.identify(userId, properties)
}

export { posthog }
