import { ReportRepository } from '../repositories/report.repository'
import type { ReportStatus } from '@prisma/client'

export const ReportService = {
  /**
   * Submit a new report with rate limiting.
   */
  async submit(data: {
    driverId: string
    reason: string
    details: string
    reporterEmail: string | null
    ipHash: string
  }): Promise<{ success: boolean; error?: string; reportId?: string }> {
    // Rate limit: max 3 reports per driver per IP per 24h
    const hasRecent = await ReportRepository.hasRecentReportsByIp(data.driverId, data.ipHash)
    if (hasRecent) {
      return {
        success: false,
        error: 'You have already submitted multiple reports for this driver. Please wait 24 hours.',
      }
    }

    const report = await ReportRepository.create(data)
    return { success: true, reportId: report.id }
  },

  // ── Admin operations ──

  async getAllForAdmin(filter: {
    status?: ReportStatus
    page?: number
    pageSize?: number
  }) {
    return ReportRepository.getAllForAdmin(filter)
  },

  async getById(id: string) {
    return ReportRepository.getById(id)
  },

  async updateStatus(id: string, status: ReportStatus, adminNotes?: string) {
    return ReportRepository.updateStatus(id, status, adminNotes)
  },

  async countActionTakenForDriver(driverId: string) {
    return ReportRepository.countActionTakenForDriver(driverId)
  },
}
