import { prisma } from '@/lib/db/prisma'
import { ProfileView } from '@prisma/client'

export class ProfileViewRepository {
  static async createView(data: {
    driverId: string
    ipHash: string
    userAgent: string
    referrer?: string
  }): Promise<ProfileView> {
    return prisma.profileView.create({
      data,
    })
  }

  static async countByDriver(driverId: string): Promise<number> {
    return prisma.profileView.count({
      where: { driverId },
    })
  }

  static async findRecentByDriverAndIp(
    driverId: string,
    ipHash: string,
    minutesAgo: number
  ): Promise<ProfileView | null> {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000)
    
    return prisma.profileView.findFirst({
      where: {
        driverId,
        ipHash,
        createdAt: {
          gte: since,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  static async incrementDriverViewCount(driverId: string): Promise<void> {
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
  }
}
