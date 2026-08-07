'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, X, RefreshCw } from '@/components/ui/icons'

interface DetectedLocation {
  city: string
  state: string
  latitude: number
  longitude: number
}

interface GeolocationBannerProps {
  onLocationDetected: (location: DetectedLocation) => void
  onDismiss: () => void
}

export function GeolocationBanner({ onLocationDetected, onDismiss }: GeolocationBannerProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'success' | 'denied' | 'error'>('idle')
  const [location, setLocation] = useState<DetectedLocation | null>(null)
  const [dismissed, setDismissed] = useState(false)

  // Check if user previously dismissed or denied
  useEffect(() => {
    const saved = localStorage.getItem('movely_geo_dismissed')
    if (saved === 'true') {
      setDismissed(true)
      return
    }

    // Auto-request on mount (browser will show its own permission prompt)
    // Only auto-request if user hasn't explicitly denied before
    const previouslyDenied = localStorage.getItem('movely_geo_denied')
    if (previouslyDenied !== 'true') {
      requestLocation()
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }

    setStatus('requesting')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode using BigDataCloud free API (no key required)
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await res.json()

          const city = data.city || data.locality || data.principalSubdivision || 'Unknown'
          const state = data.principalSubdivisionCode?.replace('US-', '') || data.principalSubdivision || ''

          const detected: DetectedLocation = {
            city,
            state,
            latitude,
            longitude,
          }

          setLocation(detected)
          setStatus('success')
          onLocationDetected(detected)
        } catch (err) {
          console.error('Reverse geocode failed:', err)
          setStatus('error')
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied')
          localStorage.setItem('movely_geo_denied', 'true')
        } else {
          setStatus('error')
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 min cache
      }
    )
  }, [onLocationDetected])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem('movely_geo_dismissed', 'true')
    onDismiss()
  }, [onDismiss])

  const handleRetry = useCallback(() => {
    localStorage.removeItem('movely_geo_denied')
    localStorage.removeItem('movely_geo_dismissed')
    setDismissed(false)
    requestLocation()
  }, [requestLocation])

  if (dismissed) return null

  // Success state — show detected location banner
  if (status === 'success' && location) {
    return (
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-blue-900 font-semibold">
              Showing drivers near {location.city}{location.state ? `, ${location.state}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
            >
              Change
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-400 hover:text-blue-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Requesting state — subtle loading indicator
  if (status === 'requesting') {
    return (
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
          <span className="text-blue-900 font-medium">Detecting your location...</span>
        </div>
      </div>
    )
  }

  // Denied or error state — show a prompt to try again (only once, dismissible)
  if (status === 'denied' || status === 'error') {
    return (
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              {status === 'denied'
                ? 'Location access denied. Showing all drivers.'
                : 'Could not detect your location. Showing all drivers.'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider"
            >
              Try again
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
