'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { revalidatePath } from 'next/cache'
import { InquiryService } from '../services/inquiry.service'
import { InquiryStatus } from '@prisma/client'

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await InquiryService.updateStatus(id, status)
    revalidatePath('/admin/inquiries')
    revalidatePath(`/admin/inquiries/${id}`)
    return { success: true }
  } catch (error) {
    console.error('[updateInquiryStatus] failed:', error)
    return { success: false, error: 'Failed to update inquiry status' }
  }
}
