'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitReport, type SubmitReportState } from '@/modules/reports/actions/submit-report'

interface ReportFormProps {
  driverId: string
  onClose: () => void
}

const REPORT_REASONS = [
  { value: 'NOT_A_REAL_DRIVER', label: 'Not a real driver', description: 'Profile appears fake or uses stock photos' },
  { value: 'SAFETY_CONCERN', label: 'Safety concern', description: 'Unsafe vehicle or dangerous driving' },
  { value: 'MISLEADING_PROFILE', label: 'Misleading profile', description: 'Vehicle or service info doesn\'t match reality' },
  { value: 'INAPPROPRIATE_CONDUCT', label: 'Inappropriate conduct', description: 'Unprofessional behavior or harassment' },
  { value: 'OTHER', label: 'Other', description: 'Something else' },
] as const

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? 'Submitting…' : 'Submit report'}
    </button>
  )
}

export function ReportForm({ driverId, onClose }: ReportFormProps) {
  const [state, formAction] = useFormState(submitReport, { status: 'idle' } as SubmitReportState)

  if (state.status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="font-bold text-gray-900 text-base mb-1">Report submitted</h4>
        <p className="text-sm text-gray-500 mb-4">
          Thank you. Our team will review this report and take appropriate action.
        </p>
        <button
          onClick={onClose}
          className="text-sm font-bold text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="driverId" value={driverId} />

      {/* Reason selector */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Reason
        </label>
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                className="mt-1 accent-red-600"
                required
              />
              <div>
                <div className="text-sm font-bold text-gray-900">{r.label}</div>
                <div className="text-xs text-gray-500">{r.description}</div>
              </div>
            </label>
          ))}
        </div>
        {state.status === 'error' && state.fieldErrors?.reason && (
          <p className="text-xs text-red-500 mt-1">{state.fieldErrors.reason}</p>
        )}
      </div>

      {/* Details */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Details
        </label>
        <textarea
          name="details"
          rows={4}
          placeholder="Please describe what happened in detail. Include dates if possible."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 resize-none"
        />
        {state.status === 'error' && state.fieldErrors?.details && (
          <p className="text-xs text-red-500 mt-1">{state.fieldErrors.details}</p>
        )}
      </div>

      {/* Email (optional) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Email <span className="text-gray-400 normal-case font-normal">(optional — for follow-up)</span>
        </label>
        <input
          type="email"
          name="reporterEmail"
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500"
        />
        {state.status === 'error' && state.fieldErrors?.reporterEmail && (
          <p className="text-xs text-red-500 mt-1">{state.fieldErrors.reporterEmail}</p>
        )}
      </div>

      {state.status === 'error' && state.message && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{state.message}</p>
      )}

      <SubmitButton />

      <p className="text-xs text-gray-400 text-center">
        False reports may result in restrictions. Only report genuine concerns.
      </p>
    </form>
  )
}
