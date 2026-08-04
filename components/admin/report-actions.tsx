'use client'

import { useTransition, useState } from 'react'
import { updateReportStatus } from '@/modules/reports/actions/admin-report-actions'
import { useRouter } from 'next/navigation'
import type { ReportStatus } from '@prisma/client'

interface Props {
  reportId: string
  currentStatus: ReportStatus
}

export function ReportStatusActions({ reportId }: Props) {
  const [pending, startTransition] = useTransition()
  const [notes, setNotes] = useState('')
  const router = useRouter()

  const handleAction = (status: ReportStatus) => {
    startTransition(async () => {
      await updateReportStatus(reportId, status, notes || undefined)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Admin notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Document your decision, evidence, or follow-up actions…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]/10 focus:border-[#0B1F3D] resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleAction('REVIEWED')}
          disabled={pending}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Mark as reviewed
        </button>
        <button
          onClick={() => handleAction('DISMISSED')}
          disabled={pending}
          className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Dismiss
        </button>
        <button
          onClick={() => handleAction('ACTION_TAKEN')}
          disabled={pending}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Action taken
        </button>
      </div>
    </div>
  )
}
