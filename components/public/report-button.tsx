'use client'

import { useState } from 'react'
import { ReportForm } from './report-form'
import { Flag } from '@/components/ui/icons'

interface ReportButtonProps {
  driverId: string
}

export function ReportButton({ driverId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
        Report this profile
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 text-lg">Report this profile</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Help us keep Movely safe. Report profiles that are misleading, unsafe, or violate our policies.
            </p>
            <ReportForm driverId={driverId} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
