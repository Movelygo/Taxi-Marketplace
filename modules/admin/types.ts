import { Driver, Lead } from '@prisma/client'

export interface AdminDriverListItem extends Driver {
  user: {
    email: string
  }
  _count: {
    leads: number
    profileViews: number
  }
}

export interface AdminLeadListItem extends Lead {
  driver: {
    displayName: string
    slug: string
  }
}
