import { Lead, LeadSource } from '@prisma/client'

export type { Lead, LeadSource }

export interface CreateLeadInput {
  driverId: string
  source: LeadSource
  ipHash: string
  userAgent: string
  referrer?: string
}
