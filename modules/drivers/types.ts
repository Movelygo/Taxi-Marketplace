import { Driver, DriverStatus, AvailabilityStatus } from '@prisma/client'

export type { Driver, DriverStatus, AvailabilityStatus }

export interface CreateDriverInput {
  userId: string
  displayName: string
  phone: string
  whatsappNumber: string
  city: string
  serviceAreaText: string
  vehicleType: string
  languages: string[]
  bio?: string
}

export interface UpdateDriverInput {
  displayName?: string
  phone?: string
  whatsappNumber?: string
  city?: string
  serviceAreaText?: string
  vehicleType?: string
  languages?: string[]
  bio?: string
  profileImageUrl?: string
  availabilityStatus?: AvailabilityStatus
}
