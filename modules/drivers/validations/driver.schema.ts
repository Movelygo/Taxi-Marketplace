import { z } from 'zod'

export const createDriverSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits').max(20),
  city: z.string().min(2, 'City is required').max(100),
  serviceAreaText: z.string().min(10, 'Service area must be at least 10 characters').max(500),
  vehicleType: z.string().min(2, 'Vehicle category is required').max(100),
  vehicleMake: z.string().max(100).optional(),
  vehicleModel: z.string().max(100).optional(),
  vehicleYear: z.coerce.number().int().min(1980, 'Year must be 1980 or later').max(new Date().getFullYear() + 1, 'Year cannot be in the future').optional(),
  vehicleColor: z.string().max(50).optional(),
  passengerCapacity: z.coerce.number().int().min(1, 'At least 1 passenger').max(50, 'Max 50 passengers').optional(),
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
  vehicleYear: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  vehicleColor: z.string().max(50).optional(),
  passengerCapacity: z.coerce.number().int().min(1).max(50).optional(),
  amenities: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  operatingHours: z.string().max(200).optional(),
  languages: z.string().min(1, 'At least one language is required').optional(),
  bio: z.string().max(1000).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
