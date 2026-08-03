'use server'

import { prisma } from '@/lib/db/prisma'
import type { ProfileAttribute } from '@prisma/client'

export async function getActiveAmenities(): Promise<ProfileAttribute[]> {
  return prisma.profileAttribute.findMany({
    where: { category: 'AMENITY', isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
  })
}

export async function getActivePaymentMethods(): Promise<ProfileAttribute[]> {
  return prisma.profileAttribute.findMany({
    where: { category: 'PAYMENT_METHOD', isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
  })
}

export async function getActiveProfileAttributes() {
  const [amenities, paymentMethods] = await Promise.all([
    getActiveAmenities(),
    getActivePaymentMethods(),
  ])
  return { amenities, paymentMethods }
}
