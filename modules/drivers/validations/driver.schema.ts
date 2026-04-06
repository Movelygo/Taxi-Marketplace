import { z } from 'zod'

export const createDriverSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits').max(20),
  city: z.string().min(2, 'City is required').max(100),
  serviceAreaText: z.string().min(10, 'Service area must be at least 10 characters').max(500),
  vehicleType: z.string().min(2, 'Vehicle type is required').max(100),
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
  vehicleType: z.string().min(2, 'Vehicle type is required').max(100).optional(),
  languages: z.string().min(1, 'At least one language is required').optional(),
  bio: z.string().max(1000).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
