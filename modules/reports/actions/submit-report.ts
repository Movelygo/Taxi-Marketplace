'use server'

import { reportSchema } from '../validations/report.schema'
import { ReportService } from '../services/report.service'
import { getClientIpHash } from '@/lib/utils/ip-hash'
import { sendEmail } from '@/lib/email/email-sender'
import { buildReportAdminHtml, buildReportAdminText } from '@/lib/email/templates/review-report-emails'
import { SystemConfigService } from '@/modules/system-config/services/system-config.service'
import { ReportRepository } from '../repositories/report.repository'

export type SubmitReportState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      message: string
      fieldErrors?: Partial<Record<'reason' | 'details' | 'reporterEmail', string>>
    }

export async function submitReport(
  _prev: SubmitReportState,
  formData: FormData,
): Promise<SubmitReportState> {
  const raw = {
    driverId: String(formData.get('driverId') ?? ''),
    reason: String(formData.get('reason') ?? ''),
    details: String(formData.get('details') ?? ''),
    reporterEmail: String(formData.get('reporterEmail') ?? '') || undefined,
  }

  const parsed = reportSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'reason' || key === 'details' || key === 'reporterEmail') {
        fieldErrors[key] = issue.message
      }
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted fields and try again.',
      fieldErrors,
    }
  }

  try {
    const ipHash = await getClientIpHash()

    const result = await ReportService.submit({
      driverId: parsed.data.driverId,
      reason: parsed.data.reason,
      details: parsed.data.details,
      reporterEmail: parsed.data.reporterEmail || null,
      ipHash,
    })

    if (!result.success) {
      return { status: 'error', message: result.error || 'Failed to submit report.' }
    }

    // Notify admin of new report
    try {
      const [adminEmail, sender, report] = await Promise.all([
        SystemConfigService.getAdminNotificationEmail(),
        SystemConfigService.getSender(),
        result.reportId ? ReportRepository.getById(result.reportId) : null,
      ])

      if (report) {
        await sendEmail({
          from: sender.full,
          to: adminEmail,
          subject: `New profile report: ${parsed.data.reason.replace(/_/g, ' ')}`,
          html: buildReportAdminHtml({
            reason: parsed.data.reason,
            details: parsed.data.details,
            reporterEmail: parsed.data.reporterEmail || null,
            driverDisplayName: report.driver.displayName,
            driverSlug: report.driver.slug,
          }),
          text: buildReportAdminText({
            reason: parsed.data.reason,
            details: parsed.data.details,
            reporterEmail: parsed.data.reporterEmail || null,
            driverDisplayName: report.driver.displayName,
          }),
        })
      }
    } catch (emailError) {
      console.error('[submitReport] admin notification email failed:', emailError)
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[submitReport] error:', error)
    return {
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    }
  }
}
