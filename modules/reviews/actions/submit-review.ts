'use server'

import { reviewSchema } from '../validations/review.schema'
import { ReviewService } from '../services/review.service'
import { getClientIpHash } from '@/lib/utils/ip-hash'
import { sendEmail } from '@/lib/email/email-sender'
import { buildReviewPendingAdminHtml, buildReviewPendingAdminText } from '@/lib/email/templates/review-report-emails'
import { SystemConfigService } from '@/modules/system-config/services/system-config.service'
import { ReviewRepository } from '../repositories/review.repository'

export type SubmitReviewState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      message: string
      fieldErrors?: Partial<Record<'rating' | 'text' | 'reviewerName' | 'reviewerEmail', string>>
    }

export async function submitReview(
  _prev: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const raw = {
    driverId: String(formData.get('driverId') ?? ''),
    rating: Number(formData.get('rating') ?? 0),
    text: String(formData.get('text') ?? ''),
    reviewerName: String(formData.get('reviewerName') ?? ''),
    reviewerEmail: String(formData.get('reviewerEmail') ?? ''),
    leadToken: String(formData.get('leadToken') ?? '') || undefined,
  }

  const parsed = reviewSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'rating' || key === 'text' || key === 'reviewerName' || key === 'reviewerEmail') {
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

    const result = await ReviewService.submit({
      driverId: parsed.data.driverId,
      rating: parsed.data.rating,
      text: parsed.data.text,
      reviewerName: parsed.data.reviewerName,
      reviewerEmail: parsed.data.reviewerEmail,
      ipHash,
      leadToken: parsed.data.leadToken,
    })

    if (!result.success) {
      return { status: 'error', message: result.error || 'Failed to submit review.' }
    }

    // Notify admin of new pending review
    try {
      const [adminEmail, sender, review] = await Promise.all([
        SystemConfigService.getAdminNotificationEmail(),
        SystemConfigService.getSender(),
        result.reviewId ? ReviewRepository.getById(result.reviewId) : null,
      ])

      if (review) {
        await sendEmail({
          from: sender.full,
          to: adminEmail,
          subject: `New review pending moderation: ${parsed.data.rating}★ for ${review.driver.displayName}`,
          html: buildReviewPendingAdminHtml({
            rating: parsed.data.rating,
            text: parsed.data.text,
            reviewerName: parsed.data.reviewerName,
            reviewerEmail: parsed.data.reviewerEmail,
            isVerifiedContact: review.isVerifiedContact,
            driverDisplayName: review.driver.displayName,
            reviewId: review.id,
          }),
          text: buildReviewPendingAdminText({
            rating: parsed.data.rating,
            text: parsed.data.text,
            reviewerName: parsed.data.reviewerName,
            reviewerEmail: parsed.data.reviewerEmail,
            driverDisplayName: review.driver.displayName,
          }),
        })
      }
    } catch (emailError) {
      console.error('[submitReview] admin notification email failed:', emailError)
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[submitReview] error:', error)
    return {
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    }
  }
}
