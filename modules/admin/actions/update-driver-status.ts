'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { AdminService } from '../services/admin.service'
import { DriverStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function updateDriverStatus(driverId: string, status: DriverStatus) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  try {
    await AdminService.updateDriverStatus(driverId, status)
    revalidatePath('/admin/drivers')
    revalidatePath(`/admin/drivers/${driverId}`)
    revalidatePath('/drivers')
    return { success: true }
  } catch (error) {
    console.error('Update driver status error:', error)
    return { error: 'Failed to update driver status' }
  }
}
