'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { SystemConfigService, SystemConfigView } from '../services/system-config.service'

export async function getSystemConfigs(): Promise<{
  configs: SystemConfigView[]
  error?: string
}> {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    return { configs: [], error: 'Unauthorized' }
  }

  try {
    const configs = await SystemConfigService.getAll()
    return { configs }
  } catch (error) {
    console.error('[getSystemConfigs] failed:', error)
    return { configs: [], error: 'Failed to load settings' }
  }
}
