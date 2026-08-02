import type { Inquiry, InquiryStatus } from '@prisma/client'
import { InquiryRepository, InquiryFilters } from '../repositories/inquiry.repository'
import type { InquiryInput } from '../validations/inquiry.schema'

export class InquiryService {
  static async submit(input: InquiryInput): Promise<Inquiry> {
    return InquiryRepository.create(input)
  }

  static async getAll(filters?: InquiryFilters): Promise<Inquiry[]> {
    return InquiryRepository.findAll(filters)
  }

  static async getById(id: string): Promise<Inquiry | null> {
    return InquiryRepository.findById(id)
  }

  static async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    return InquiryRepository.updateStatus(id, status)
  }

  static async getStatusCounts(): Promise<Record<InquiryStatus, number>> {
    return InquiryRepository.countByStatus()
  }
}
