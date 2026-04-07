'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { AdminService } from '../services/admin.service'
import { revalidatePath } from 'next/cache'

export async function toggleFeatured(driverId: string, isFeatured: boolean) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  try {
    await AdminService.toggleFeatured(driverId, isFeatured)
    revalidatePath('/admin/drivers')
    revalidatePath(`/admin/drivers/${driverId}`)
    revalidatePath('/drivers')
    return { success: true }
  } catch (error) {
    console.error('Toggle featured error:', error)
    return { error: 'Failed to toggle featured status' }
  }
}
