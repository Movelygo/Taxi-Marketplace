import { LeadRepository } from '../repositories/lead.repository'
import { LeadSource } from '@prisma/client'
import { createHash } from 'crypto'

export class LeadService {
  static async trackLead(data: {
    driverId: string
    source: LeadSource
    ip?: string
    userAgent?: string
    referrer?: string
  }) {
    const ipHash = data.ip ? this.hashIp(data.ip) : 'unknown'

    return LeadRepository.createLead({
      driverId: data.driverId,
      source: data.source,
      ipHash,
      userAgent: data.userAgent || 'unknown',
      referrer: data.referrer,
    })
  }

  static async getLeadCountByDriver(driverId: string): Promise<number> {
    return LeadRepository.countByDriver(driverId)
  }

  static async getLeadCountBySource(driverId: string, source: LeadSource): Promise<number> {
    return LeadRepository.countByDriverAndSource(driverId, source)
  }

  private static hashIp(ip: string): string {
    return createHash('sha256').update(ip).digest('hex')
  }
}
