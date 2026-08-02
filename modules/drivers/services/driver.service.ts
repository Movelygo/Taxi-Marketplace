import { DriverRepository } from '../repositories/driver.repository'
import type { CreateDriverInput, UpdateDriverInput } from '../validations/driver.schema'
import type { Driver, AvailabilityStatus } from '@prisma/client'

export class DriverService {
  static async createProfile(userId: string, input: CreateDriverInput): Promise<Driver> {
    const languages = input.languages.split(',').map(lang => lang.trim()).filter(Boolean)
    
    const slug = await this.generateUniqueSlug(input.displayName)

    return await DriverRepository.create({
      userId,
      slug,
      displayName: input.displayName,
      phone: input.phone,
      whatsappNumber: input.whatsappNumber,
      city: input.city,
      serviceAreaText: input.serviceAreaText,
      vehicleType: input.vehicleType,
      languages,
      bio: input.bio,
      availabilityStatus: input.availabilityStatus as AvailabilityStatus,
    })
  }

  static async updateProfile(userId: string, input: UpdateDriverInput): Promise<Driver> {
    const updateData: Parameters<typeof DriverRepository.update>[1] = {}

    if (input.displayName !== undefined) updateData.displayName = input.displayName
    if (input.phone !== undefined) updateData.phone = input.phone
    if (input.whatsappNumber !== undefined) updateData.whatsappNumber = input.whatsappNumber
    if (input.city !== undefined) updateData.city = input.city
    if (input.serviceAreaText !== undefined) updateData.serviceAreaText = input.serviceAreaText
    if (input.vehicleType !== undefined) updateData.vehicleType = input.vehicleType
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

  static async getPublicProfile(slug: string): Promise<Driver | null> {
    return await DriverRepository.findApprovedBySlug(slug)
  }

  static async getPublicDrivers(city?: string): Promise<Driver[]> {
    return await DriverRepository.findAllApproved(city)
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
