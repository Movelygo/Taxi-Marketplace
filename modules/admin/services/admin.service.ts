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

  static async getStatusCounts(): Promise<Record<DriverStatus, number>> {
    return AdminRepository.getDriverCountByStatus()
  }
}
