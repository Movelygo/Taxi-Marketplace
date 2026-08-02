'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { InquiryStatus } from '@prisma/client'

const statuses: (InquiryStatus | 'ALL')[] = ['ALL', 'NEW', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED']

interface InquiryFiltersProps {
  statusFilter?: InquiryStatus
}

export function InquiryFilters({ statusFilter }: InquiryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleStatusChange = (status: InquiryStatus | 'ALL') => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'ALL') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {statuses.map((status) => {
        const isActive =
          (status === 'ALL' && !statusFilter) || status === statusFilter

        const base =
          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors'
        const active =
          'bg-[#0B1F3D] text-white border-[#0B1F3D]'
        const inactive =
          'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'

        return (
          <button
            key={status}
            type="button"
            onClick={() => handleStatusChange(status)}
            className={`${base} ${isActive ? active : inactive}`}
          >
            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
          </button>
        )
      })}
    </div>
  )
}
