import { prisma } from '@/lib/db/prisma'
import type { City } from '@prisma/client'
import type { CreateCityInput, UpdateCityInput } from '../types'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export class CityRepository {
  static async findAll(): Promise<City[]> {
    return prisma.city.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
  }

  static async findAllActive(): Promise<City[]> {
    return prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
  }

  static async findById(id: string): Promise<City | null> {
    return prisma.city.findUnique({ where: { id } })
  }

  static async findBySlug(slug: string): Promise<City | null> {
    return prisma.city.findUnique({ where: { slug } })
  }

  static async findByName(name: string): Promise<City | null> {
    return prisma.city.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })
  }

  static async create(input: CreateCityInput): Promise<City> {
    let slug = slugify(input.name)
    let counter = 1
    while (await prisma.city.findUnique({ where: { slug } })) {
      slug = `${slugify(input.name)}-${counter}`
      counter++
    }

    const maxOrder = await prisma.city.aggregate({ _max: { sortOrder: true } })
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1

    return prisma.city.create({
      data: {
        name: input.name,
        slug,
        state: input.state,
        sortOrder,
      },
    })
  }

  static async update(id: string, input: UpdateCityInput): Promise<City> {
    const data: Record<string, unknown> = {}
    if (input.name !== undefined) data.name = input.name
    if (input.state !== undefined) data.state = input.state
    if (input.isActive !== undefined) data.isActive = input.isActive
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder

    return prisma.city.update({ where: { id }, data })
  }

  static async delete(id: string): Promise<void> {
    await prisma.city.delete({ where: { id } })
  }

  static async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.city.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  }
}
