import { prisma } from '@/lib/db/prisma'
import type { Inquiry } from '@prisma/client'
import type { InquiryInput } from '../validations/inquiry.schema'

export class InquiryRepository {
  static async create(data: InquiryInput): Promise<Inquiry> {
    return prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    })
  }
}
