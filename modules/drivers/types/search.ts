export interface DriverSearchParams {
  q?: string
  city?: string
  vehicleType?: string
  amenities?: string[]
  paymentMethods?: string[]
  minCapacity?: number
  availabilityStatus?: string
  sort?: 'featured' | 'newest'
  page?: number
  pageSize?: number
}

export interface DriverSearchResult {
  drivers: Array<{
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
    availabilityStatus: string
    profileImageUrl: string | null
    whatsappNumber: string
    phone: string
    isFeatured: boolean
    bio: string | null
    cityRel: { name: string; state: string } | null
  }>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type SortOption = 'featured' | 'newest'

export const DEFAULT_PAGE_SIZE = 12
