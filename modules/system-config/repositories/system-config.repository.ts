import { prisma } from '@/lib/db/prisma'
import { SystemConfig } from '@prisma/client'

export interface SystemConfigInput {
  key: string
  value: string
  description?: string
  updatedBy?: string
}

export class SystemConfigRepository {
  static async findByKey(key: string): Promise<SystemConfig | null> {
    return prisma.systemConfig.findUnique({ where: { key } })
  }

  static async findAll(): Promise<SystemConfig[]> {
    return prisma.systemConfig.findMany({ orderBy: { key: 'asc' } })
  }

  static async upsert({
    key,
    value,
    description,
    updatedBy,
  }: SystemConfigInput): Promise<SystemConfig> {
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, description, updatedBy },
    })
  }

  static async create({
    key,
    value,
    description,
    updatedBy,
  }: SystemConfigInput): Promise<SystemConfig> {
    return prisma.systemConfig.create({
      data: { key, value, description, updatedBy },
    })
  }

  static async exists(key: string): Promise<boolean> {
    const count = await prisma.systemConfig.count({ where: { key } })
    return count > 0
  }
}
