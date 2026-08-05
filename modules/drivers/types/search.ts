import type { AvailabilityStatus } from '@prisma/client'

export interface DriverSearchParams {
  q?: string
  city?: string
  vehicleType?: string
  amenities?: string[]
  paymentMethods?: string[]
  minCapacity?: number
  availabilityStatus?: AvailabilityStatus
  sort?: 'featured' | 'newest' | 'rating'
  page?: number
  pageSize?: number
  pickup?: string
  destination?: string
  exactRoute?: boolean
}

export interface DriverSearchResultItem {
  id: string
  slug: string
  displayName: string
  city: string
  vehicleType: string
  vehicleMake: string | null
  vehicleModel: string | null
  passengerCapacity: number | null
  languages: string[]
  amenities: string[]
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  profileImageUrl: string | null
  whatsappNumber: string
  phone: string
  isFeatured: boolean
  bio: string | null
  cityRel: { name: string; state: string } | null
  photos: { url: string; sortOrder: number }[]
  rating: number | null
  reviewCount: number
}

export interface DriverSearchResult {
  drivers: DriverSearchResultItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type SortOption = 'featured' | 'newest' | 'rating'

export const DEFAULT_PAGE_SIZE = 12
