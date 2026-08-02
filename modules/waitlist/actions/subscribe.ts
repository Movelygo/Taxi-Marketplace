'use server'

import { waitlistSchema } from '../validations/waitlist.schema'
import { WaitlistService } from '../services/waitlist.service'

export type SubscribeState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Partial<Record<'email', string>> }

/**
 * Server action used by the public Coming Soon waitlist form.
 *
 * Validates the email with Zod, persists it (idempotently) via
 * WaitlistService, and returns a typed state. Duplicates are treated as
 * success so re-signups never surface an error to the visitor.
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const raw = {
    email: String(formData.get('email') ?? ''),
  }

  const parsed = waitlistSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Partial<Record<'email', string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'email') {
        fieldErrors.email = issue.message
      }
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted field and try again.',
      fieldErrors,
    }
  }

  try {
    await WaitlistService.subscribe(parsed.data)
    return { status: 'success' }
  } catch (error) {
    console.error('[subscribe] persistence failure:', error)
    return {
      status: 'error',
      message:
        'We couldn\'t save your email right now. Please email us directly at hello@movelygo.com and we\'ll add you to the list.',
    }
  }
}
