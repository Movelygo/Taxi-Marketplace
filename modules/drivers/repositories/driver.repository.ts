import { prisma } from '@/lib/db/prisma'
import type { Driver, AvailabilityStatus, City } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { DriverSearchParams, DriverSearchResult } from '../types/search'
import { DEFAULT_PAGE_SIZE } from '../types/search'

export function buildDriverSearchWhere(params: DriverSearchParams): Prisma.DriverWhereInput {
  // Build the where clause
  const where: Prisma.DriverWhereInput = { status: 'APPROVED' }
  const and: Prisma.DriverWhereInput[] = []

  // Text search — ILIKE on multiple fields
  if (params.q?.trim()) {
    const term = params.q.trim()
    and.push({
      OR: [
        { displayName: { contains: term, mode: 'insensitive' } },
        { vehicleMake: { contains: term, mode: 'insensitive' } },
        { vehicleModel: { contains: term, mode: 'insensitive' } },
        { vehicleType: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
        { cityRel: { name: { contains: term, mode: 'insensitive' } } },
        { serviceAreas: { some: { city: { name: { contains: term, mode: 'insensitive' } } } } },
      ],
    })
  }

  // City filter (matches free-text city OR cityRel.name)
  if (params.city) {
    and.push({
      OR: [
        { city: { equals: params.city, mode: 'insensitive' } },
        { cityRel: { name: { equals: params.city, mode: 'insensitive' } } },
      ],
    })
  }

  // Vehicle type filter
  if (params.vehicleType) where.vehicleType = { equals: params.vehicleType, mode: 'insensitive' }

  // Amenities — driver must have ALL selected amenities (AND logic)
  if (params.amenities?.length) where.amenities = { hasEvery: params.amenities }

  // Payment methods — driver must accept ALL selected methods (AND logic)
  if (params.paymentMethods?.length) where.paymentMethods = { hasEvery: params.paymentMethods }

  // Minimum passenger capacity
  if (params.minCapacity !== undefined) where.passengerCapacity = { gte: params.minCapacity }

  // Availability status
  if (params.availabilityStatus) where.availabilityStatus = params.availabilityStatus

  // Trip intent filter: pickup/destination matching against ServiceArea
  const tripCities: string[] = []
  if (params.pickup?.trim()) tripCities.push(params.pickup.trim())
  if (params.destination?.trim()) tripCities.push(params.destination.trim())

  if (tripCities.length > 0) {
    if (params.exactRoute && tripCities.length === 2) {
      // AND: driver must serve BOTH pickup AND destination
      and.push({
        AND: tripCities.map(cityName => ({
          serviceAreas: {
            some: {
              city: { name: { equals: cityName, mode: 'insensitive' } },
            },
          },
        })),
      })
    } else {
      // OR: driver serves at least one of the trip cities
      and.push({
        serviceAreas: {
          some: {
            city: { name: { in: tripCities, mode: 'insensitive' } },
          },
        },
      })
    }
  }

  if (and.length > 0) where.AND = and

  return where
}

export class DriverRepository {
  static async create(data: {
    userId: string
    slug: string
    displayName: string
    phone: string
    whatsappNumber: string
    cityId?: string
    city: string
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
      include: {
        cityRel: {
          select: {
            name: true,
            state: true,
          },
        },
        serviceAreas: {
          include: {
            city: {
              select: { name: true, state: true },
            },
          },
          orderBy: { city: { name: 'asc' } },
        },
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
      sort = 'featured',
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
    } = params

    const where = buildDriverSearchWhere(params)

    // Sorting
    const orderBy: Prisma.DriverOrderByWithRelationInput[] =
      sort === 'newest'
        ? [{ createdAt: 'desc' }]
        : sort === 'rating'
          ? [{ isFeatured: 'desc' }, { reviews: { _count: 'desc' } }]
          : [
              { isFeatured: 'desc' },
              { featuredOrder: 'asc' },
              { createdAt: 'desc' },
            ]

    // Pagination
    const total = await prisma.driver.count({ where })
    const totalPages = Math.ceil(total / pageSize)
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages)
    const skip = (currentPage - 1) * pageSize
    const take = pageSize

    // Run count before data so out-of-range pages can be clamped
    const drivers = await prisma.driver.findMany({
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
        serviceAreas: {
          select: { city: { select: { name: true } } },
        },
        photos: {
          select: { url: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    })

    // Compute rating summary per driver and strip review data from output
    const driversWithRating = drivers.map((d) => {
      const { reviews, ...rest } = d
      const count = reviews.length
      const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
      return {
        ...rest,
        rating: count >= 3 ? Math.round(average * 10) / 10 : null, // threshold per guidelines
        reviewCount: count,
      }
    })

    return {
      drivers: driversWithRating,
      total,
      page: currentPage,
      pageSize,
      totalPages,
    }
  }
}
