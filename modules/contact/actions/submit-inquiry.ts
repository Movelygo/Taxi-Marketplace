'use server'

import { inquirySchema } from '../validations/inquiry.schema'
import { InquiryService } from '../services/inquiry.service'

export type SubmitInquiryState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      message: string
      fieldErrors?: Partial<Record<'name' | 'email' | 'subject' | 'message', string>>
    }

/**
 * Server action used by the public /contact page.
 *
 * Validates the form input with Zod, persists it via InquiryService, and
 * returns a typed state. Never exposes internal database errors — if the
 * persistence layer fails (e.g. the migration hasn't been applied yet),
 * the user gets a friendly message that redirects them to email instead.
 */
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
    await InquiryService.submit(parsed.data)
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
