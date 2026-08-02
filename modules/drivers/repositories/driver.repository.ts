import { prisma } from '@/lib/db/prisma'
import type { Driver, AvailabilityStatus } from '@prisma/client'

export class DriverRepository {
  static async create(data: {
    userId: string
    slug: string
    displayName: string
    phone: string
    whatsappNumber: string
    city: string
    serviceAreaText: string
    vehicleType: string
    languages: string[]
    bio?: string
    availabilityStatus: AvailabilityStatus
  }): Promise<Driver> {
    return await prisma.driver.create({
      data,
    })
  }

  static async findByUserId(userId: string): Promise<Driver | null> {
    return await prisma.driver.findUnique({
      where: { userId },
    })
  }

  static async findBySlug(slug: string): Promise<Driver | null> {
    return await prisma.driver.findUnique({
      where: { slug },
    })
  }

  static async update(
    userId: string,
    data: {
      displayName?: string
      phone?: string
      whatsappNumber?: string
      city?: string
      serviceAreaText?: string
      vehicleType?: string
      languages?: string[]
      bio?: string
      availabilityStatus?: AvailabilityStatus
      profileImageUrl?: string
    }
  ): Promise<Driver> {
    return await prisma.driver.update({
      where: { userId },
      data,
    })
  }

  static async updateProfileImage(userId: string, profileImageUrl: string): Promise<Driver> {
    return await prisma.driver.update({
      where: { userId },
      data: { profileImageUrl },
    })
  }

  static async checkSlugExists(slug: string): Promise<boolean> {
    const driver = await prisma.driver.findUnique({
      where: { slug },
      select: { id: true },
    })
    return !!driver
  }

  static async findApprovedBySlug(slug: string): Promise<Driver | null> {
    return await prisma.driver.findFirst({
      where: {
        slug,
        status: 'APPROVED',
      },
    })
  }

  static async findAllApproved(city?: string): Promise<Driver[]> {
    return await prisma.driver.findMany({
      where: {
        status: 'APPROVED',
        ...(city ? { city } : {}),
      },
      orderBy: [
        { isFeatured: 'desc' },
        { featuredOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })
  }

  /**
   * Returns drivers admin has flagged as featured for the homepage,
   * ordered by featuredOrder (lower = earlier).
   */
  static async findFeaturedApproved(limit: number = 6): Promise<Driver[]> {
    return await prisma.driver.findMany({
      where: {
        status: 'APPROVED',
        isFeatured: true,
      },
      orderBy: [
        { featuredOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })
  }

  static async getUniqueCities(): Promise<string[]> {
    const result = await prisma.driver.findMany({
      where: { status: 'APPROVED' },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    })
    return result.map(r => r.city)
  }
}
