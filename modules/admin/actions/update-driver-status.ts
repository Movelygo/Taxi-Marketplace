'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { AdminService } from '../services/admin.service'
import { DriverStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@/lib/email/email-sender'
import {
  buildDriverStatusNotificationHtml,
  buildDriverStatusNotificationText,
} from '@/lib/email/templates/driver-status-notification'
import { SystemConfigService } from '@/modules/system-config/services/system-config.service'

export async function updateDriverStatus(driverId: string, status: DriverStatus) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  try {
    const previousDriver = await AdminService.getDriverWithUserById(driverId)
    if (!previousDriver) {
      return { error: 'Driver not found' }
    }

    const shouldNotify = previousDriver.status !== status && (
      status === 'APPROVED' || status === 'REJECTED' || status === 'SUSPENDED'
    )

    const updated = await AdminService.updateDriverStatus(driverId, status)

    if (shouldNotify) {
      try {
        const [subjectApproval, subjectRejection, sender] = await Promise.all([
          SystemConfigService.getDriverApprovalSubject(),
          SystemConfigService.getDriverRejectionSubject(),
          SystemConfigService.getSender(),
        ])

        const subject = status === 'APPROVED' ? subjectApproval : subjectRejection

        await sendEmail({
          from: sender.full,
          to: previousDriver.user.email,
          subject,
          html: buildDriverStatusNotificationHtml({
            displayName: updated.displayName,
            status,
            slug: updated.slug,
          }),
          text: buildDriverStatusNotificationText({
            displayName: updated.displayName,
            status,
            slug: updated.slug,
          }),
        })
      } catch (emailError) {
        Sentry.captureException(emailError, {
          extra: { driverId, status, context: 'driver-status-notification' },
        })
        console.error('[updateDriverStatus] notification email failed:', emailError)
      }
    }

    revalidatePath('/admin/drivers')
    revalidatePath(`/admin/drivers/${driverId}`)
    revalidatePath('/drivers')
    return { success: true }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { driverId, status, context: 'update-driver-status' },
    })
    console.error('Update driver status error:', error)
    return { error: 'Failed to update driver status' }
  }
}
