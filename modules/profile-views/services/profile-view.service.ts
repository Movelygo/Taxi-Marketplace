import { ProfileViewRepository } from '../repositories/profile-view.repository'
import { createHash } from 'crypto'

const DEDUPLICATION_WINDOW_MINUTES = 30

export class ProfileViewService {
  static async trackView(data: {
    driverId: string
    ip?: string
    userAgent?: string
    referrer?: string
  }) {
    const ipHash = data.ip ? this.hashIp(data.ip) : 'unknown'

    const recentView = await ProfileViewRepository.findRecentByDriverAndIp(
      data.driverId,
      ipHash,
      DEDUPLICATION_WINDOW_MINUTES
    )

    if (recentView) {
      return { counted: false }
    }

    await ProfileViewRepository.createView({
      driverId: data.driverId,
      ipHash,
      userAgent: data.userAgent || 'unknown',
      referrer: data.referrer,
    })

    await ProfileViewRepository.incrementDriverViewCount(data.driverId)

    return { counted: true }
  }

  static async getViewCountByDriver(driverId: string): Promise<number> {
    return ProfileViewRepository.countByDriver(driverId)
  }

  private static hashIp(ip: string): string {
    return createHash('sha256').update(ip).digest('hex')
  }
}
