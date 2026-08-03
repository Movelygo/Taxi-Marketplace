import { z } from 'zod'

// Preprocess helper: convert empty string / null to undefined for optional number fields
// This prevents z.coerce.number() from converting "" to 0 (which would fail min validation)
const optionalNumber = (min: number, max: number, minMsg: string, maxMsg: string) =>
  z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined
      const num = Number(val)
      return Number.isNaN(num) ? undefined : num
    },
    z.number({ invalid_type_error: 'Must be a valid number' }).int().min(min, minMsg).max(max, maxMsg).optional()
  )

export const createDriverSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits').max(20),
  city: z.string().min(2, 'City is required').max(100),
  serviceAreaText: z.string().min(10, 'Service area must be at least 10 characters').max(500),
  vehicleType: z.string().min(2, 'Vehicle category is required').max(100),
  vehicleMake: z.string().max(100).optional(),
  vehicleModel: z.string().max(100).optional(),
  vehicleYear: optionalNumber(1980, new Date().getFullYear() + 1, 'Year must be 1980 or later', 'Year cannot be in the future'),
  vehicleColor: z.string().max(50).optional(),
  passengerCapacity: optionalNumber(1, 50, 'At least 1 passenger', 'Max 50 passengers'),
  amenities: z.array(z.string()).default([]),
  paymentMethods: z.array(z.string()).default([]),
  operatingHours: z.string().max(200).optional(),
  languages: z.string().min(1, 'At least one language is required'),
  bio: z.string().max(1000).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).default('AVAILABLE'),
})

export const updateDriverSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100).optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20).optional(),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits').max(20).optional(),
  city: z.string().min(2, 'City is required').max(100).optional(),
  serviceAreaText: z.string().min(10, 'Service area must be at least 10 characters').max(500).optional(),
  vehicleType: z.string().min(2, 'Vehicle category is required').max(100).optional(),
  vehicleMake: z.string().max(100).optional(),
  vehicleModel: z.string().max(100).optional(),
  vehicleYear: optionalNumber(1980, new Date().getFullYear() + 1, 'Year must be 1980 or later', 'Year cannot be in the future'),
  vehicleColor: z.string().max(50).optional(),
  passengerCapacity: optionalNumber(1, 50, 'At least 1 passenger', 'Max 50 passengers'),
  amenities: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  operatingHours: z.string().max(200).optional(),
  languages: z.string().min(1, 'At least one language is required').optional(),
  bio: z.string().max(1000).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
