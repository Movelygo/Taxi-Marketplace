import { prisma } from '@/lib/db/prisma'
import { Lead, LeadSource } from '@prisma/client'

export class LeadRepository {
  static async createLead(data: {
    driverId: string
    source: LeadSource
    ipHash: string
    userAgent: string
    referrer?: string
  }): Promise<Lead> {
    return prisma.lead.create({
      data,
    })
  }

  static async countByDriver(driverId: string): Promise<number> {
    return prisma.lead.count({
      where: { driverId },
    })
  }

  static async countByDriverAndSource(driverId: string, source: LeadSource): Promise<number> {
    return prisma.lead.count({
      where: { 
        driverId,
        source,
      },
    })
  }

  static async findRecentByDriverAndIp(
    driverId: string,
    ipHash: string,
    minutesAgo: number
  ): Promise<Lead | null> {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000)
    
    return prisma.lead.findFirst({
      where: {
        driverId,
        ipHash,
        createdAt: {
          gte: since,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}
