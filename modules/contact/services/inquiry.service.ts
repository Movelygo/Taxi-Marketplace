import type { Inquiry } from '@prisma/client'
import { InquiryRepository } from '../repositories/inquiry.repository'
import type { InquiryInput } from '../validations/inquiry.schema'

export class InquiryService {
  static async submit(input: InquiryInput): Promise<Inquiry> {
    return InquiryRepository.create(input)
  }
}
