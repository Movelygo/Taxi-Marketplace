import { DriverRepository } from '../repositories/driver.repository'
import { CityRepository } from '@/modules/cities/repositories/city.repository'
import { prisma } from '@/lib/db/prisma'
import type { CreateDriverInput, UpdateDriverInput } from '../validations/driver.schema'
import type { DriverSearchParams, DriverSearchResult } from '../types/search'
import type { Driver, AvailabilityStatus, City, ProfileAttribute } from '@prisma/client'

export class DriverService {
  static async createProfile(userId: string, input: CreateDriverInput): Promise<Driver> {
    const languages = input.languages.split(',').map(lang => lang.trim()).filter(Boolean)

    const slug = await this.generateUniqueSlug(input.displayName)

    // Resolve cityId from city name (case-insensitive match)
    let cityId: string | undefined
    const cityRecord = await DriverRepository.findCityByName(input.city)
    if (cityRecord) {
      cityId = cityRecord.id
    }

    const driver = await DriverRepository.create({
      userId,
      slug,
      displayName: input.displayName,
      phone: input.phone,
      whatsappNumber: input.whatsappNumber,
      cityId,
      city: input.city,
      vehicleType: input.vehicleType,
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
      vehicleYear: input.vehicleYear,
      vehicleColor: input.vehicleColor,
      passengerCapacity: input.passengerCapacity,
      amenities: input.amenities,
      paymentMethods: input.paymentMethods,
      operatingHours: input.operatingHours,
      languages,
      bio: input.bio,
      availabilityStatus: input.availabilityStatus as AvailabilityStatus,
    })

    // Create ServiceArea records
    if (input.serviceAreaCityIds.length > 0) {
      await prisma.serviceArea.createMany({
        data: input.serviceAreaCityIds.map(cityId => ({
          driverId: driver.id,
          cityId,
        })),
        skipDuplicates: true,
      })
    }

    return driver
  }

  static async updateProfile(userId: string, input: UpdateDriverInput): Promise<Driver> {
    const updateData: Parameters<typeof DriverRepository.update>[1] = {}

    if (input.displayName !== undefined) updateData.displayName = input.displayName
    if (input.phone !== undefined) updateData.phone = input.phone
    if (input.whatsappNumber !== undefined) updateData.whatsappNumber = input.whatsappNumber
    if (input.city !== undefined) {
      updateData.city = input.city
      const cityRecord = await DriverRepository.findCityByName(input.city)
      if (cityRecord) updateData.cityId = cityRecord.id
    }
    if (input.serviceAreaCityIds !== undefined) {
      // Replace all service areas: delete existing, create new
      const existingDriver = await DriverRepository.findByUserId(userId)
      if (existingDriver) {
        await prisma.serviceArea.deleteMany({ where: { driverId: existingDriver.id } })
        if (input.serviceAreaCityIds.length > 0) {
          await prisma.serviceArea.createMany({
            data: input.serviceAreaCityIds.map(cityId => ({
              driverId: existingDriver.id,
              cityId,
            })),
            skipDuplicates: true,
          })
        }
      }
    }
    if (input.vehicleType !== undefined) updateData.vehicleType = input.vehicleType
    if (input.vehicleMake !== undefined) updateData.vehicleMake = input.vehicleMake || null
    if (input.vehicleModel !== undefined) updateData.vehicleModel = input.vehicleModel || null
    if (input.vehicleYear !== undefined) updateData.vehicleYear = input.vehicleYear ?? null
    if (input.vehicleColor !== undefined) updateData.vehicleColor = input.vehicleColor || null
    if (input.passengerCapacity !== undefined) updateData.passengerCapacity = input.passengerCapacity ?? null
    if (input.amenities !== undefined) updateData.amenities = input.amenities
    if (input.paymentMethods !== undefined) updateData.paymentMethods = input.paymentMethods
    if (input.operatingHours !== undefined) updateData.operatingHours = input.operatingHours || null
    if (input.bio !== undefined) updateData.bio = input.bio
    if (input.availabilityStatus !== undefined) updateData.availabilityStatus = input.availabilityStatus as AvailabilityStatus

    if (input.languages !== undefined) {
      updateData.languages = input.languages.split(',').map(lang => lang.trim()).filter(Boolean)
    }

    return await DriverRepository.update(userId, updateData)
  }

  static async getProfile(userId: string): Promise<Driver | null> {
    return await DriverRepository.findByUserId(userId)
  }

  static async updateProfileImage(userId: string, imageUrl: string): Promise<Driver> {
    return await DriverRepository.updateProfileImage(userId, imageUrl)
  }

  static async getPublicProfile(slug: string) {
    return await DriverRepository.findApprovedBySlug(slug)
  }

  static async getPublicDrivers(city?: string): Promise<Driver[]> {
    return await DriverRepository.findAllApproved(city)
  }

  static async searchPublicDrivers(params: DriverSearchParams): Promise<DriverSearchResult> {
    return await DriverRepository.searchApproved(params)
  }

  /**
   * Fetch all data needed for the public directory page in a single
   * sequential flow to minimize concurrent DB connections in serverless.
   * Returns search results + cities + profile attributes (amenities/payment).
   */
  static async getDirectoryData(params: DriverSearchParams): Promise<{
    searchResult: DriverSearchResult
    cities: City[]
    amenities: ProfileAttribute[]
    paymentMethods: ProfileAttribute[]
  }> {
    // Run directory queries sequentially to keep serverless connection usage bounded
    const searchResult = await DriverRepository.searchApproved(params)
    const cities = await CityRepository.findAllActive()
    const attributes = await prisma.profileAttribute.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    })
    const amenities = attributes.filter((attribute) => attribute.category === 'AMENITY')
    const paymentMethods = attributes.filter((attribute) => attribute.category === 'PAYMENT_METHOD')

    return { searchResult, cities, amenities, paymentMethods }
  }

  static async getFeaturedDrivers(limit: number = 6): Promise<Driver[]> {
    return await DriverRepository.findFeaturedApproved(limit)
  }

  static async getAvailableCities(): Promise<string[]> {
    return await DriverRepository.getUniqueCities()
  }

  private static async generateUniqueSlug(displayName: string): Promise<string> {
    const baseSlug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1

    while (await DriverRepository.checkSlugExists(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }
}
