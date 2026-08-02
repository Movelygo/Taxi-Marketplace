'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { AdminService } from '../services/admin.service'

export async function reorderFeatured(orderedIds: string[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string')) {
    return { error: 'Invalid input.' }
  }

  try {
    await AdminService.reorderFeatured(orderedIds)
    revalidatePath('/admin/featured')
    revalidatePath('/admin/drivers')
    revalidatePath('/drivers')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Reorder featured error:', error)
    return { error: 'Failed to reorder featured drivers' }
  }
}

export async function moveFeatured(driverId: string, direction: 'up' | 'down') {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  try {
    const featured = await AdminService.getFeaturedDrivers()
    const ids = featured.map((d) => d.id)
    const idx = ids.indexOf(driverId)
    if (idx === -1) return { error: 'Driver not found in featured list.' }

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= ids.length) return { success: true } // already at boundary

    ;[ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]]

    await AdminService.reorderFeatured(ids)
    revalidatePath('/admin/featured')
    revalidatePath('/drivers')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Move featured error:', error)
    return { error: 'Failed to move driver' }
  }
}
