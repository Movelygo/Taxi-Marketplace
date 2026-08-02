'use server'

import { inquirySchema } from '../validations/inquiry.schema'
import { InquiryService } from '../services/inquiry.service'
import { SystemConfigService } from '@/modules/system-config/services/system-config.service'
import { sendEmail } from '@/lib/email/email-sender'
import {
  buildInquiryAdminNotificationHtml,
  buildInquiryAdminNotificationText,
} from '@/lib/email/templates/inquiry-admin-notification'

export type SubmitInquiryState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      message: string
      fieldErrors?: Partial<Record<'name' | 'email' | 'subject' | 'message', string>>
    }

export async function submitInquiry(
  _prev: SubmitInquiryState,
  formData: FormData,
): Promise<SubmitInquiryState> {
  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    subject: String(formData.get('subject') ?? ''),
    message: String(formData.get('message') ?? ''),
  }

  const parsed = inquirySchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: SubmitInquiryState extends { fieldErrors?: infer F } ? F : never =
      {} as never
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'name' || key === 'email' || key === 'subject' || key === 'message') {
        ;(fieldErrors as Record<string, string>)[key] = issue.message
      }
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted fields and try again.',
      fieldErrors,
    }
  }

  try {
    const inquiry = await InquiryService.submit(parsed.data)

    try {
      const [adminEmail, sender] = await Promise.all([
        SystemConfigService.getAdminNotificationEmail(),
        SystemConfigService.getSender(),
      ])

      await sendEmail({
        from: sender.full,
        to: adminEmail,
        subject: `New Movely inquiry: ${inquiry.subject}`,
        html: buildInquiryAdminNotificationHtml(inquiry),
        text: buildInquiryAdminNotificationText(inquiry),
        replyTo: inquiry.email,
      })
    } catch (emailError) {
      console.error('[submitInquiry] notification email failed:', emailError)
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[submitInquiry] persistence failure:', error)
    return {
      status: 'error',
      message:
        'We couldn\'t save your message right now. Please email us directly at hello@movelygo.com and we\'ll respond as soon as possible.',
    }
  }
}
