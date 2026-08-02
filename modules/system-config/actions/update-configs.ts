'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { revalidatePath } from 'next/cache'
import { SystemConfigService } from '../services/system-config.service'
import { updateConfigSchema } from '../validations/system-config.schema'

export type UpdateConfigsState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

export async function updateSystemConfigs(
  _prev: UpdateConfigsState,
  formData: FormData,
): Promise<UpdateConfigsState> {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    return { status: 'error', message: 'Unauthorized' }
  }

  const raw: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      raw[key] = value
    }
  }

  const parsed = updateConfigSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (path) fieldErrors[path] = issue.message
    }
    return {
      status: 'error',
      message: 'Please fix the highlighted fields.',
      fieldErrors,
    }
  }

  try {
    await SystemConfigService.setMany(parsed.data, user.id)
    revalidatePath('/admin/settings')
    return { status: 'success' }
  } catch (error) {
    console.error('[updateSystemConfigs] failed:', error)
    return { status: 'error', message: 'Failed to save settings. Please try again.' }
  }
}

export async function seedSystemConfigs(): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await SystemConfigService.seedDefaults(user.id)
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('[seedSystemConfigs] failed:', error)
    return { success: false, error: 'Failed to seed default settings' }
  }
}
