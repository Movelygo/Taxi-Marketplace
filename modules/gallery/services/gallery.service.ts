import { GalleryRepository } from '../repositories/gallery.repository'
import { SystemConfigService } from '@/modules/system-config/services/system-config.service'
import type { DriverPhoto } from '@prisma/client'

export class GalleryService {
  static async getByDriverId(driverId: string): Promise<DriverPhoto[]> {
    return GalleryRepository.findByDriverId(driverId)
  }

  static async getByDriverSlug(slug: string): Promise<DriverPhoto[]> {
    return GalleryRepository.findByDriverSlug(slug)
  }

  static async getPhotoLimit(): Promise<number> {
    return SystemConfigService.getFreePhotoLimit()
  }

  static async addPhoto(driverId: string, url: string): Promise<DriverPhoto> {
    const limit = await this.getPhotoLimit()
    const count = await GalleryRepository.countByDriverId(driverId)
    if (count >= limit) {
      throw new Error(`Photo limit reached (${limit}). Remove a photo to add a new one.`)
    }
    return GalleryRepository.create({ driverId, url })
  }

  static async deletePhoto(id: string): Promise<void> {
    await GalleryRepository.delete(id)
  }

  static async reorderPhotos(ids: string[]): Promise<void> {
    await GalleryRepository.reorder(ids)
  }
}
