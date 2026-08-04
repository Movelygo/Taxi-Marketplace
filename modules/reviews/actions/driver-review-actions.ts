'use server'

import { reviewResponseSchema, reviewFlagSchema } from '../validations/review.schema'
import { ReviewService } from '../services/review.service'
import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { DriverService } from '@/modules/drivers/services/driver.service'

export type ReviewResponseState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function respondToReview(
  _prev: ReviewResponseState,
  formData: FormData,
): Promise<ReviewResponseState> {
  const raw = {
    reviewId: String(formData.get('reviewId') ?? ''),
    response: String(formData.get('response') ?? ''),
  }

  const parsed = reviewResponseSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { status: 'error', message: 'You must be signed in to respond to reviews.' }
    }

    const driver = await DriverService.getProfile(user.id)
    if (!driver) {
      return { status: 'error', message: 'Driver profile not found.' }
    }

    await ReviewService.setDriverResponse(parsed.data.reviewId, driver.id, parsed.data.response)
    return { status: 'success' }
  } catch (error) {
    console.error('[respondToReview] error:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to submit response.',
    }
  }
}

export type ReviewFlagState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function flagReview(
  _prev: ReviewFlagState,
  formData: FormData,
): Promise<ReviewFlagState> {
  const raw = {
    reviewId: String(formData.get('reviewId') ?? ''),
    reason: String(formData.get('reason') ?? ''),
  }

  const parsed = reviewFlagSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message || 'Invalid input.' }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { status: 'error', message: 'You must be signed in to flag a review.' }
    }

    const driver = await DriverService.getProfile(user.id)
    if (!driver) {
      return { status: 'error', message: 'Driver profile not found.' }
    }

    await ReviewService.flagByDriver(parsed.data.reviewId, driver.id, parsed.data.reason)
    return { status: 'success' }
  } catch (error) {
    console.error('[flagReview] error:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to flag review.',
    }
  }
}
