import { prisma } from '@/lib/db/prisma'
import { Inquiry, InquiryStatus } from '@prisma/client'
import type { InquiryInput } from '../validations/inquiry.schema'

export interface InquiryFilters {
  status?: InquiryStatus
}

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

  static async findAll(filters?: InquiryFilters): Promise<Inquiry[]> {
    return prisma.inquiry.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async findById(id: string): Promise<Inquiry | null> {
    return prisma.inquiry.findUnique({ where: { id } })
  }

  static async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    return prisma.inquiry.update({
      where: { id },
      data: { status },
    })
  }

  static async countByStatus(): Promise<Record<InquiryStatus, number>> {
    const counts = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: true,
    })

    const result: Record<string, number> = {
      NEW: 0,
      IN_REVIEW: 0,
      RESOLVED: 0,
      ARCHIVED: 0,
    }

    counts.forEach((item: { status: InquiryStatus; _count: number }) => {
      result[item.status] = item._count
    })

    return result as Record<InquiryStatus, number>
  }
}
