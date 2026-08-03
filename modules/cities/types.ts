import type { City as PrismaCity } from '@prisma/client'

export type City = PrismaCity

export interface CreateCityInput {
  name: string
  state: string
}

export interface UpdateCityInput {
  name?: string
  state?: string
  isActive?: boolean
  sortOrder?: number
}
