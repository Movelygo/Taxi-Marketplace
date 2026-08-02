import Link from 'next/link'
import type { CompletenessResult } from '@/modules/drivers/services/profile-completeness.service'

interface ProfileCompletenessCardProps {
  completeness: CompletenessResult
  /**
   * If true, render a more compact variant (e.g. for admin tables / sidebars).
   */
  compact?: boolean
}

export function ProfileCompletenessCard({ completeness, compact = false }: ProfileCompletenessCardProps) {
  const { percentage, completedCount, totalCount, missing, isComplete } = completeness

  if (compact) {
    return <CompactCompletenessBar percentage={percentage} />
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-5">
          <CompletenessRing percentage={percentage} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900">Profile completeness</h3>
              {isComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {isComplete
                ? 'Your profile has everything customers need.'
                : `${completedCount} of ${totalCount} sections complete. A complete profile gets more leads.`}
            </p>
          </div>
        </div>
      </div>

      {!isComplete && missing.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            What&apos;s missing
          </p>
          <ul className="space-y-2.5">
            {missing.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-white transition-colors"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0B1F3D]">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.hint}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-[#0B1F3D] group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Circular progress ring — premium, minimalist.
 * Uses SVG strokeDasharray for a clean stroke effect.
 */
function CompletenessRing({ percentage }: { percentage: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const isComplete = percentage === 100

  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-100"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={isComplete ? 'text-green-500' : 'text-[#0B1F3D]'}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-base font-bold ${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

/**
 * Compact horizontal bar — for use in dense surfaces (admin lists, sidebars).
 */
function CompactCompletenessBar({ percentage }: { percentage: number }) {
  const color =
    percentage === 100
      ? 'bg-green-500'
      : percentage >= 75
        ? 'bg-[#0B1F3D]'
        : percentage >= 50
          ? 'bg-amber-400'
          : 'bg-red-400'

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 tabular-nums w-9 text-right">
        {percentage}%
      </span>
    </div>
  )
}
