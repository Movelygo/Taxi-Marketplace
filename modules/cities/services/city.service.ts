import { prisma } from '@/lib/db/prisma'
import { CityRepository } from '../repositories/city.repository'
import type { City } from '@prisma/client'
import type { CreateCityInput, UpdateCityInput } from '../types'

export class CityService {
  static async getAll(): Promise<City[]> {
    return CityRepository.findAll()
  }

  static async getAllActive(): Promise<City[]> {
    return CityRepository.findAllActive()
  }

  static async getById(id: string): Promise<City | null> {
    return CityRepository.findById(id)
  }

  static async getBySlug(slug: string): Promise<City | null> {
    return CityRepository.findBySlug(slug)
  }

  static async create(input: CreateCityInput): Promise<City> {
    const existing = await CityRepository.findByName(input.name)
    if (existing) {
      throw new Error(`City "${input.name}" already exists`)
    }
    return CityRepository.create(input)
  }

  static async update(id: string, input: UpdateCityInput): Promise<City> {
    return CityRepository.update(id, input)
  }

  static async toggleActive(id: string, isActive: boolean): Promise<City> {
    return CityRepository.update(id, { isActive })
  }

  static async reorder(ids: string[]): Promise<void> {
    await CityRepository.reorder(ids)
  }

  static async delete(id: string): Promise<void> {
    const city = await CityRepository.findById(id)
    if (!city) throw new Error('City not found')

    const driversInCity = await prisma.driver.count({
      where: { cityId: id },
    })
    if (driversInCity > 0) {
      throw new Error(
        `Cannot delete city "${city.name}" — ${driversInCity} driver(s) are assigned to it. Reassign them first.`
      )
    }

    await CityRepository.delete(id)
  }
}
