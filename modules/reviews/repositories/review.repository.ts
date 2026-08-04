import { prisma } from '@/lib/db/prisma'
import type { Review, ReviewStatus, ReviewFlagStatus } from '@prisma/client'

export interface ReviewWithDriver extends Review {
  driver: { id: string; displayName: string; slug: string; user: { email: string } }
}

export interface ReviewRatingSummary {
  average: number
  count: number
  distribution: { rating: number; count: number }[]
}

export const ReviewRepository = {
  /**
   * Create a new review (always PENDING).
   * Anti-fraud check is done in the service layer before calling this.
   */
  async create(data: {
    driverId: string
    rating: number
    text: string
    reviewerName: string
    reviewerEmail: string
    ipHash: string
    isVerifiedContact: boolean
  }): Promise<Review> {
    return prisma.review.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    })
  },

  /**
   * Check if an IP has already reviewed this driver in the last 24 hours.
   */
  async hasRecentReviewByIp(driverId: string, ipHash: string): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const count = await prisma.review.count({
      where: {
        driverId,
        ipHash,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })
    return count > 0
  },

  /**
   * Check if a lead token exists for this driver (for verified-contact badge).
   * The lead token is stored in localStorage on the client when they click
   * WhatsApp/Call. We correlate via ipHash + driverId.
   */
  async hasLeadFromIp(driverId: string, ipHash: string): Promise<boolean> {
    const count = await prisma.lead.count({
      where: {
        driverId,
        ipHash,
      },
    })
    return count > 0
  },

  /**
   * Get approved reviews for a driver (public display), newest first.
   */
  async getApprovedByDriver(driverId: string, limit = 50): Promise<Review[]> {
    return prisma.review.findMany({
      where: {
        driverId,
        status: 'APPROVED',
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })
  },

  /**
   * Get rating summary for a driver (average + distribution).
   * Only counts APPROVED reviews.
   */
  async getRatingSummary(driverId: string): Promise<ReviewRatingSummary> {
    const reviews = await prisma.review.findMany({
      where: { driverId, status: 'APPROVED' },
      select: { rating: true },
    })

    const count = reviews.length
    const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0

    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
    }))

    return { average, count, distribution }
  },

  /**
   * Get all reviews for admin moderation queue.
   */
  async getAllForAdmin(filter: {
    status?: ReviewStatus
    flaggedOnly?: boolean
    page?: number
    pageSize?: number
  }): Promise<{ reviews: ReviewWithDriver[]; total: number }> {
    const { status, flaggedOnly, page = 1, pageSize = 20 } = filter
    const skip = (page - 1) * pageSize

    const where = {
      ...(status && { status }),
      ...(flaggedOnly && { isFlaggedByDriver: true, flagStatus: 'FLAG_PENDING' as ReviewFlagStatus }),
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              displayName: true,
              slug: true,
              user: { select: { email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ])

    return { reviews: reviews as ReviewWithDriver[], total }
  },

  /**
   * Get a single review by ID (for admin detail view).
   */
  async getById(id: string): Promise<ReviewWithDriver | null> {
    return prisma.review.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            user: { select: { email: true } },
          },
        },
      },
    }) as Promise<ReviewWithDriver | null>
  },

  /**
   * Update review status (approve/reject). Sets publishedAt on approval.
   */
  async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'APPROVED' ? new Date() : null,
      },
    })
  },

  /**
   * Add or update driver's public response to a review.
   */
  async setDriverResponse(id: string, response: string): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data: {
        driverResponse: response,
        driverRespondedAt: new Date(),
      },
    })
  },

  /**
   * Driver flags a review as unfair (appeal).
   */
  async flagByDriver(id: string, reason: string): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data: {
        isFlaggedByDriver: true,
        flagReason: reason,
        flaggedAt: new Date(),
        flagStatus: 'FLAG_PENDING',
      },
    })
  },

  /**
   * Admin resolves a flag (dismiss or remove).
   */
  async resolveFlag(
    id: string,
    resolution: 'FLAG_DISMISSED' | 'FLAG_REMOVED',
    resolvedBy: string,
  ): Promise<Review> {
    const status = resolution === 'FLAG_REMOVED' ? 'REJECTED' : undefined
    return prisma.review.update({
      where: { id },
      data: {
        flagStatus: resolution,
        flagResolvedBy: resolvedBy,
        flagResolvedAt: new Date(),
        ...(status && { status }),
      },
    })
  },

  /**
   * Get all reviews for a driver (for driver dashboard, read-only).
   */
  async getByDriverForDriver(driverId: string): Promise<Review[]> {
    return prisma.review.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * Get rating summaries for multiple drivers at once (for directory cards).
   */
  async getRatingSummaries(driverIds: string[]): Promise<Map<string, ReviewRatingSummary>> {
    if (driverIds.length === 0) return new Map()

    const reviews = await prisma.review.findMany({
      where: {
        driverId: { in: driverIds },
        status: 'APPROVED',
      },
      select: { driverId: true, rating: true },
    })

    const map = new Map<string, ReviewRatingSummary>()
    for (const id of driverIds) {
      const driverReviews = reviews.filter((r) => r.driverId === id)
      const count = driverReviews.length
      const average = count > 0 ? driverReviews.reduce((s, r) => s + r.rating, 0) / count : 0
      const distribution = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: driverReviews.filter((r) => r.rating === rating).length,
      }))
      map.set(id, { average, count, distribution })
    }
    return map
  },
}
