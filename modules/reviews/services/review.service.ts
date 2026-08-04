import { ReviewRepository, type ReviewRatingSummary } from '../repositories/review.repository'
import type { ReviewStatus } from '@prisma/client'

export const ReviewService = {
  /**
   * Submit a new review with anti-fraud checks.
   * Returns { success, error? } — error is a user-friendly message.
   */
  async submit(data: {
    driverId: string
    rating: number
    text: string
    reviewerName: string
    reviewerEmail: string
    ipHash: string
    leadToken?: string
  }): Promise<{ success: boolean; error?: string; reviewId?: string }> {
    // Anti-fraud: 1 review per driver per IP per 24h
    const hasRecent = await ReviewRepository.hasRecentReviewByIp(data.driverId, data.ipHash)
    if (hasRecent) {
      return {
        success: false,
        error: 'You have already reviewed this driver recently. Please wait 24 hours before submitting another review.',
      }
    }

    // Verified-contact badge: check if this IP has a lead for this driver
    const isVerifiedContact = await ReviewRepository.hasLeadFromIp(data.driverId, data.ipHash)

    const review = await ReviewRepository.create({
      driverId: data.driverId,
      rating: data.rating,
      text: data.text,
      reviewerName: data.reviewerName,
      reviewerEmail: data.reviewerEmail,
      ipHash: data.ipHash,
      isVerifiedContact,
    })

    return { success: true, reviewId: review.id }
  },

  /**
   * Get approved reviews for public display on a driver profile.
   */
  async getApprovedForDriver(driverId: string) {
    return ReviewRepository.getApprovedByDriver(driverId)
  },

  /**
   * Get rating summary for a driver profile.
   */
  async getRatingSummary(driverId: string): Promise<ReviewRatingSummary> {
    return ReviewRepository.getRatingSummary(driverId)
  },

  /**
   * Get rating summaries for multiple drivers (for directory cards).
   */
  async getRatingSummaries(driverIds: string[]): Promise<Map<string, ReviewRatingSummary>> {
    return ReviewRepository.getRatingSummaries(driverIds)
  },

  // ── Admin operations ──

  async getAllForAdmin(filter: {
    status?: ReviewStatus
    flaggedOnly?: boolean
    page?: number
    pageSize?: number
  }) {
    return ReviewRepository.getAllForAdmin(filter)
  },

  async getById(id: string) {
    return ReviewRepository.getById(id)
  },

  async approve(id: string): Promise<void> {
    await ReviewRepository.updateStatus(id, 'APPROVED')
  },

  async reject(id: string): Promise<void> {
    await ReviewRepository.updateStatus(id, 'REJECTED')
  },

  async resolveFlag(
    id: string,
    resolution: 'FLAG_DISMISSED' | 'FLAG_REMOVED',
    resolvedBy: string,
  ): Promise<void> {
    await ReviewRepository.resolveFlag(id, resolution, resolvedBy)
  },

  // ── Driver operations ──

  async getByDriverForDriver(driverId: string) {
    return ReviewRepository.getByDriverForDriver(driverId)
  },

  async setDriverResponse(reviewId: string, driverId: string, response: string) {
    // Verify the review belongs to this driver
    const review = await ReviewRepository.getById(reviewId)
    if (!review || review.driverId !== driverId) {
      throw new Error('Review not found or does not belong to this driver.')
    }
    if (review.status !== 'APPROVED') {
      throw new Error('You can only respond to approved reviews.')
    }
    await ReviewRepository.setDriverResponse(reviewId, response)
  },

  async flagByDriver(reviewId: string, driverId: string, reason: string) {
    const review = await ReviewRepository.getById(reviewId)
    if (!review || review.driverId !== driverId) {
      throw new Error('Review not found or does not belong to this driver.')
    }
    if (review.isFlaggedByDriver) {
      throw new Error('You have already flagged this review.')
    }
    await ReviewRepository.flagByDriver(reviewId, reason)
  },
}
