import { AdminRepository } from '../repositories/admin.repository'
import { Driver, DriverStatus } from '@prisma/client'

export class AdminService {
  static async getAllDrivers(status?: DriverStatus): Promise<Driver[]> {
    return AdminRepository.findAllDrivers(status)
  }

  static async getDriverById(id: string): Promise<Driver | null> {
    return AdminRepository.findDriverById(id)
  }

  static async updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
    return AdminRepository.updateDriverStatus(id, status)
  }

  static async toggleFeatured(id: string, isFeatured: boolean): Promise<Driver> {
    return AdminRepository.toggleFeatured(id, isFeatured)
  }

  static async updateFeaturedOrder(id: string, featuredOrder: number): Promise<Driver> {
    return AdminRepository.updateFeaturedOrder(id, featuredOrder)
  }

  static async getFeaturedDrivers(): Promise<Driver[]> {
    return AdminRepository.findFeaturedOrdered()
  }

  /**
   * Reorders the featured drivers list. Accepts an array of driver IDs in
   * the desired display order. Persists by writing each driver's
   * `featuredOrder` to its index in the array.
   */
  static async reorderFeatured(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        AdminRepository.updateFeaturedOrder(id, index),
      ),
    )
  }

  static async getStatusCounts(): Promise<Record<DriverStatus, number>> {
    return AdminRepository.getDriverCountByStatus()
  }

  static async getRecentDrivers(limit: number = 5): Promise<Driver[]> {
    return AdminRepository.findRecentDrivers(limit)
  }
}
