'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function DriversError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { route: '/drivers' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <main className="min-h-[60vh] bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">The driver directory is temporarily unavailable</h1>
        <p className="mb-6 text-gray-600">
          We could not load the latest results. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#0B1F3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#001F3F]"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
