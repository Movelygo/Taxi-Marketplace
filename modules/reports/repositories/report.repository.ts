import { prisma } from '@/lib/db/prisma'
import type { Report, ReportStatus } from '@prisma/client'

export interface ReportWithDriver extends Report {
  driver: { id: string; displayName: string; slug: string; status: string }
}

export const ReportRepository = {
  async create(data: {
    driverId: string
    reason: string
    details: string
    reporterEmail: string | null
    ipHash: string
  }): Promise<Report> {
    return prisma.report.create({
      data: {
        ...data,
        reason: data.reason as any,
        status: 'NEW',
      },
    })
  },

  /**
   * Rate limit: max 3 reports per driver per IP per 24h.
   */
  async hasRecentReportsByIp(driverId: string, ipHash: string): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const count = await prisma.report.count({
      where: {
        driverId,
        ipHash,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })
    return count >= 3
  },

  async getAllForAdmin(filter: {
    status?: ReportStatus
    page?: number
    pageSize?: number
  }): Promise<{ reports: ReportWithDriver[]; total: number }> {
    const { status, page = 1, pageSize = 20 } = filter
    const skip = (page - 1) * pageSize

    const where = {
      ...(status && { status }),
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              displayName: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.report.count({ where }),
    ])

    return { reports: reports as ReportWithDriver[], total }
  },

  async getById(id: string): Promise<ReportWithDriver | null> {
    return prisma.report.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            status: true,
          },
        },
      },
    }) as Promise<ReportWithDriver | null>
  },

  async updateStatus(id: string, status: ReportStatus, adminNotes?: string): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
    })
  },

  /**
   * Count approved reports (ACTION_TAKEN) for a driver — used for suspension logic.
   */
  async countActionTakenForDriver(driverId: string): Promise<number> {
    return prisma.report.count({
      where: {
        driverId,
        status: 'ACTION_TAKEN',
      },
    })
  },
}
