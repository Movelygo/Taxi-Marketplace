import Link from 'next/link'
import type { CompletenessResult } from '@/modules/drivers/services/profile-completeness.service'
import { CheckCircle2, ChevronRight } from '@/components/ui/icons'

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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <CompletenessRing percentage={percentage} />

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Profile completeness</h3>
              {isComplete && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider border border-green-100">
                  <CheckCircle2 className="w-3 h-3" />
                  Complete
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-xl">
              {isComplete
                ? 'Your profile has everything customers need. Ready to connect with passengers!'
                : `${completedCount} of ${totalCount} sections complete. A 100% complete profile gets up to 3x more leads.`}
            </p>
          </div>
        </div>
      </div>

      {!isComplete && missing.length > 0 && (
        <div className="border-t border-gray-50 bg-[#FBFBFC] px-6 py-5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
            Next steps to 100%
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {missing.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-[#0B1F3D] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full border-4 border-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-[#0B1F3D]">
                      {item.label}
                    </p>
                    <p className="text-[9px] font-medium text-gray-500">{item.hint}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0B1F3D] transition-colors" />
              </Link>
            ))}
          </div>
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
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const isComplete = percentage === 100

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-50"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={isComplete ? 'text-green-500' : 'text-[#0B1F3D]'}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-black tracking-tighter ${isComplete ? 'text-green-600' : 'text-[#0B1F3D]'}`}>
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
