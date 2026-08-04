'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { ReportService } from '../services/report.service'
import { revalidatePath } from 'next/cache'
import type { ReportStatus } from '@prisma/client'

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes?: string,
) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') return { error: 'Unauthorized.' }

  try {
    await ReportService.updateStatus(reportId, status, adminNotes)
    revalidatePath('/admin/reports')
    revalidatePath(`/admin/reports/${reportId}`)
    return { success: true }
  } catch (error) {
    console.error('[updateReportStatus] error:', error)
    return { error: 'Failed to update report status.' }
  }
}
