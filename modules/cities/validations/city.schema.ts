import { z } from 'zod'

export const createCitySchema = z.object({
  name: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name must be at most 100 characters'),
  state: z
    .string()
    .min(2, 'State is required')
    .max(100, 'State must be at most 100 characters'),
})

export const updateCitySchema = z.object({
  name: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name must be at most 100 characters')
    .optional(),
  state: z
    .string()
    .min(2, 'State is required')
    .max(100, 'State must be at most 100 characters')
    .optional(),
  isActive: z.boolean().optional(),
})

export type CreateCityFormData = z.infer<typeof createCitySchema>
export type UpdateCityFormData = z.infer<typeof updateCitySchema>
