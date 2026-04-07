import { ProfileViewService } from '@/modules/profile-views/services/profile-view.service'
import { LeadService } from '@/modules/leads/services/lead.service'

export interface DriverMetrics {
  profileViews: number
  totalLeads: number
  whatsappLeads: number
  callLeads: number
}

export class DriverMetricsService {
  static async getMetrics(driverId: string): Promise<DriverMetrics> {
    const [profileViews, totalLeads, whatsappLeads, callLeads] = await Promise.all([
      ProfileViewService.getViewCountByDriver(driverId),
      LeadService.getLeadCountByDriver(driverId),
      LeadService.getLeadCountBySource(driverId, 'WHATSAPP'),
      LeadService.getLeadCountBySource(driverId, 'CALL'),
    ])

    return {
      profileViews,
      totalLeads,
      whatsappLeads,
      callLeads,
    }
  }
}
