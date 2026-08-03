import { prisma } from '@/lib/db/prisma'
import type { DriverPhoto } from '@prisma/client'

export class GalleryRepository {
  static async findByDriverId(driverId: string): Promise<DriverPhoto[]> {
    return prisma.driverPhoto.findMany({
      where: { driverId },
      orderBy: { sortOrder: 'asc' },
    })
  }

  static async findByDriverSlug(slug: string): Promise<DriverPhoto[]> {
    const driver = await prisma.driver.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!driver) return []
    return this.findByDriverId(driver.id)
  }

  static async create(data: { driverId: string; url: string; sortOrder?: number }): Promise<DriverPhoto> {
    const sortOrder = data.sortOrder ?? (await prisma.driverPhoto.count({ where: { driverId: data.driverId } }))
    return prisma.driverPhoto.create({
      data: {
        driverId: data.driverId,
        url: data.url,
        sortOrder,
      },
    })
  }

  static async delete(id: string): Promise<void> {
    await prisma.driverPhoto.delete({ where: { id } })
  }

  static async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.driverPhoto.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  }

  static async countByDriverId(driverId: string): Promise<number> {
    return prisma.driverPhoto.count({ where: { driverId } })
  }
}
