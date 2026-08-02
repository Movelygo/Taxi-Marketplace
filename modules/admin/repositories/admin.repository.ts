import { prisma } from '@/lib/db/prisma'
import { Driver, DriverStatus } from '@prisma/client'

export class AdminRepository {
  static async findAllDrivers(status?: DriverStatus): Promise<Driver[]> {
    return prisma.driver.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async findDriverById(id: string): Promise<Driver | null> {
    return prisma.driver.findUnique({
      where: { id },
    })
  }

  static async findDriverWithUserById(id: string): Promise<(Driver & { user: { email: string } }) | null> {
    return prisma.driver.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    })
  }

  static async updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
    return prisma.driver.update({
      where: { id },
      data: { status },
    })
  }

  static async toggleFeatured(id: string, isFeatured: boolean): Promise<Driver> {
    return prisma.driver.update({
      where: { id },
      data: { isFeatured },
    })
  }

  static async updateFeaturedOrder(id: string, featuredOrder: number): Promise<Driver> {
    return prisma.driver.update({
      where: { id },
      data: { featuredOrder },
    })
  }

  /**
   * Returns all currently featured (and approved) drivers in their
   * admin-defined display order. Used by the admin Featured page.
   */
  static async findFeaturedOrdered(): Promise<Driver[]> {
    return prisma.driver.findMany({
      where: {
        isFeatured: true,
        status: 'APPROVED',
      },
      orderBy: [
        { featuredOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })
  }

  static async getDriverCountByStatus(): Promise<Record<DriverStatus, number>> {
    const counts = await prisma.driver.groupBy({
      by: ['status'],
      _count: true,
    })

    const result: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      SUSPENDED: 0,
    }

    counts.forEach((item: { status: DriverStatus; _count: number }) => {
      result[item.status] = item._count
    })

    return result as Record<DriverStatus, number>
  }

  static async findRecentDrivers(limit: number = 5): Promise<Driver[]> {
    return prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}
