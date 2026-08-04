import { z } from 'zod'

function firstValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value
}

function optionalString(max: number) {
  return z.preprocess(
    (value) => {
      const normalized = firstValue(value)
      return typeof normalized === 'string' && normalized.trim() ? normalized.trim() : undefined
    },
    z.string().max(max).optional(),
  )
}

function optionalInteger(min: number, max: number) {
  return z.preprocess(
    (value) => {
      const normalized = firstValue(value)
      return normalized === undefined || normalized === '' ? undefined : Number(normalized)
    },
    z.number().int().min(min).max(max).optional(),
  )
}

function stringArray(value: unknown) {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

export const driverSearchQuerySchema = z.object({
  q: optionalString(100),
  city: optionalString(100),
  vehicleType: optionalString(50),
  amenities: z.preprocess(stringArray, z.array(z.string().trim().min(1).max(50)).max(20)),
  paymentMethods: z.preprocess(stringArray, z.array(z.string().trim().min(1).max(50)).max(20)),
  minCapacity: optionalInteger(1, 100),
  availabilityStatus: z.preprocess(
    firstValue,
    z.enum(['AVAILABLE', 'BUSY', 'OFFLINE']).optional(),
  ),
  sort: z.preprocess(firstValue, z.enum(['featured', 'newest', 'rating']).default('featured')),
  page: z.preprocess(
    (value) => {
      const normalized = firstValue(value)
      return normalized === undefined || normalized === '' ? 1 : Number(normalized)
    },
    z.number().int().min(1).max(1000),
  ),
})

export type DriverSearchQuery = z.infer<typeof driverSearchQuerySchema>

export function urlSearchParamsToObject(searchParams: URLSearchParams) {
  const result: Record<string, string | string[]> = {}

  for (const [key, value] of searchParams.entries()) {
    const existing = result[key]
    if (existing === undefined) {
      result[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      result[key] = [existing, value]
    }
  }

  return result
}
