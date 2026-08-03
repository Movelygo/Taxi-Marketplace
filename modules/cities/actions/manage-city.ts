'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { CityService } from '../services/city.service'
import { createCitySchema, updateCitySchema } from '../validations/city.schema'
import type { CityState } from './types'

export async function createCity(
  _prev: CityState,
  formData: FormData
): Promise<CityState> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  const raw = {
    name: formData.get('name') as string,
    state: formData.get('state') as string,
  }

  const parsed = createCitySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await CityService.create(parsed.data)
    revalidatePath('/admin/cities')
    revalidatePath('/')
    revalidatePath('/drivers')
    return { success: true }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Failed to create city',
    }
  }
}

export async function updateCityAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') {
    return
  }

  const id = formData.get('id') as string
  if (!id) return

  const raw: Record<string, unknown> = {}
  const name = formData.get('name') as string | null
  const state = formData.get('state') as string | null
  const isActive = formData.get('isActive') as string | null

  if (name !== null) raw.name = name
  if (state !== null) raw.state = state
  if (isActive !== null) raw.isActive = isActive === 'true'

  const parsed = updateCitySchema.safeParse(raw)
  if (!parsed.success) return

  try {
    await CityService.update(id, parsed.data)
    revalidatePath('/admin/cities')
    revalidatePath('/')
    revalidatePath('/drivers')
  } catch (error) {
    console.error('Update city error:', error)
  }
}

export async function deleteCityAction(id: string): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  try {
    await CityService.delete(id)
    revalidatePath('/admin/cities')
    return { success: true }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Failed to delete city',
    }
  }
}

export async function reorderCitiesAction(ids: string[]): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') {
    return { error: 'Unauthorized. Admin access required.' }
  }

  try {
    await CityService.reorder(ids)
    revalidatePath('/admin/cities')
    return { success: true }
  } catch {
    return { error: 'Failed to reorder cities' }
  }
}
