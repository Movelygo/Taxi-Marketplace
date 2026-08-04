'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { ReviewService } from '../services/review.service'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email/email-sender'
import { buildReviewApprovedHtml, buildReviewApprovedText } from '@/lib/email/templates/review-report-emails'
import { SystemConfigService } from '@/modules/system-config/services/system-config.service'
import { ReviewRepository } from '../repositories/review.repository'

export async function approveReview(reviewId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') return { error: 'Unauthorized.' }

  try {
    await ReviewService.approve(reviewId)

    // Notify driver that their review was approved
    try {
      const [sender, review] = await Promise.all([
        SystemConfigService.getSender(),
        ReviewRepository.getById(reviewId),
      ])

      if (review) {
        await sendEmail({
          from: sender.full,
          to: review.driver.user.email,
          subject: `New ${review.rating}-star review on your Movely profile`,
          html: buildReviewApprovedHtml({
            rating: review.rating,
            text: review.text,
            reviewerName: review.reviewerName,
            isVerifiedContact: review.isVerifiedContact,
            driverSlug: review.driver.slug,
          }),
          text: buildReviewApprovedText({
            rating: review.rating,
            text: review.text,
            reviewerName: review.reviewerName,
            driverSlug: review.driver.slug,
          }),
        })
      }
    } catch (emailError) {
      console.error('[approveReview] driver notification email failed:', emailError)
    }

    revalidatePath('/admin/reviews')
    revalidatePath(`/admin/reviews/${reviewId}`)
    return { success: true }
  } catch (error) {
    console.error('[approveReview] error:', error)
    return { error: 'Failed to approve review.' }
  }
}

export async function rejectReview(reviewId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') return { error: 'Unauthorized.' }

  try {
    await ReviewService.reject(reviewId)
    revalidatePath('/admin/reviews')
    revalidatePath(`/admin/reviews/${reviewId}`)
    return { success: true }
  } catch (error) {
    console.error('[rejectReview] error:', error)
    return { error: 'Failed to reject review.' }
  }
}

export async function resolveFlag(
  reviewId: string,
  resolution: 'FLAG_DISMISSED' | 'FLAG_REMOVED',
) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') return { error: 'Unauthorized.' }

  try {
    await ReviewService.resolveFlag(reviewId, resolution, user.id)
    revalidatePath('/admin/reviews')
    revalidatePath(`/admin/reviews/${reviewId}`)
    return { success: true }
  } catch (error) {
    console.error('[resolveFlag] error:', error)
    return { error: 'Failed to resolve flag.' }
  }
}
