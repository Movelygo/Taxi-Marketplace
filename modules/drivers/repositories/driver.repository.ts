import { prisma } from '@/lib/db/prisma'
import type { Driver, AvailabilityStatus, City } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { DriverSearchParams, DriverSearchResult } from '../types/search'
import { DEFAULT_PAGE_SIZE } from '../types/search'

export class DriverRepository {
  static async create(data: {
    userId: string
    slug: string
    displayName: string
    phone: string
    whatsappNumber: string
    cityId?: string
    city: string
    serviceAreaText: string
    vehicleType: string
    vehicleMake?: string | null
    vehicleModel?: string | null
    vehicleYear?: number | null
    vehicleColor?: string | null
    passengerCapacity?: number | null
    amenities?: string[]
    paymentMethods?: string[]
    operatingHours?: string | null
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

  static async findCityByName(name: string): Promise<City | null> {
    return await prisma.city.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })
  }

  static async update(
    userId: string,
    data: {
      displayName?: string
      phone?: string
      whatsappNumber?: string
      cityId?: string
      city?: string
      serviceAreaText?: string
      vehicleType?: string
      vehicleMake?: string | null
      vehicleModel?: string | null
      vehicleYear?: number | null
      vehicleColor?: string | null
      passengerCapacity?: number | null
      amenities?: string[]
      paymentMethods?: string[]
      operatingHours?: string | null
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
        ...(city
          ? { OR: [{ city: { equals: city, mode: 'insensitive' } }, { cityRel: { name: { equals: city, mode: 'insensitive' } } }] }
          : {}),
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

  /**
   * Full-text search with filters, sorting, and pagination.
   * Uses Postgres ILIKE for text search (no external search service).
   */
  static async searchApproved(params: DriverSearchParams): Promise<DriverSearchResult> {
    const {
      q,
      city,
      vehicleType,
      amenities,
      paymentMethods,
      minCapacity,
      availabilityStatus,
      sort = 'featured',
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
    } = params

    // Build the where clause
    const where: Prisma.DriverWhereInput = {
      status: 'APPROVED',
    }

    // Text search — ILIKE on multiple fields
    if (q && q.trim()) {
      const term = q.trim()
      where.OR = [
        { displayName: { contains: term, mode: 'insensitive' } },
        { vehicleMake: { contains: term, mode: 'insensitive' } },
        { vehicleModel: { contains: term, mode: 'insensitive' } },
        { vehicleType: { contains: term, mode: 'insensitive' } },
        { serviceAreaText: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
        { cityRel: { name: { contains: term, mode: 'insensitive' } } },
      ]
    }

    // City filter (matches free-text city OR cityRel.name)
    if (city) {
      where.OR = [
        ...(where.OR ?? []),
        { city: { equals: city, mode: 'insensitive' } },
        { cityRel: { name: { equals: city, mode: 'insensitive' } } },
      ]
    }

    // Vehicle type filter
    if (vehicleType) {
      where.vehicleType = { equals: vehicleType, mode: 'insensitive' }
    }

    // Amenities — array overlap (driver has at least one of the selected)
    if (amenities && amenities.length > 0) {
      where.amenities = { hasSome: amenities }
    }

    // Payment methods — array overlap
    if (paymentMethods && paymentMethods.length > 0) {
      where.paymentMethods = { hasSome: paymentMethods }
    }

    // Minimum passenger capacity
    if (minCapacity) {
      where.passengerCapacity = { gte: minCapacity }
    }

    // Availability status
    if (availabilityStatus) {
      where.availabilityStatus = availabilityStatus as AvailabilityStatus
    }

    // Sorting
    const orderBy: Prisma.DriverOrderByWithRelationInput[] =
      sort === 'newest'
        ? [{ createdAt: 'desc' }]
        : [
            { isFeatured: 'desc' },
            { featuredOrder: 'asc' },
            { createdAt: 'desc' },
          ]

    // Pagination
    const skip = (page - 1) * pageSize
    const take = pageSize

    // Run count and data in parallel
    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          slug: true,
          displayName: true,
          city: true,
          vehicleType: true,
          vehicleMake: true,
          vehicleModel: true,
          passengerCapacity: true,
          languages: true,
          amenities: true,
          availabilityStatus: true,
          profileImageUrl: true,
          whatsappNumber: true,
          phone: true,
          isFeatured: true,
          bio: true,
          cityRel: { select: { name: true, state: true } },
        },
      }),
      prisma.driver.count({ where }),
    ])

    return {
      drivers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }
}
