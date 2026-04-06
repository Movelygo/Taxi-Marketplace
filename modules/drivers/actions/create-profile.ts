'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { createDriverSchema } from '../validations/driver.schema'
import { DriverService } from '../services/driver.service'

type CreateProfileState = {
  error?: {
    displayName?: string[]
    phone?: string[]
    whatsappNumber?: string[]
    city?: string[]
    serviceAreaText?: string[]
    vehicleType?: string[]
    languages?: string[]
    bio?: string[]
  } | string
} | undefined

export async function createProfile(_prevState: CreateProfileState, formData: FormData): Promise<CreateProfileState> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const existingProfile = await DriverService.getProfile(user.id)
  if (existingProfile) {
    return { error: 'Profile already exists' }
  }

  const rawData = {
    displayName: formData.get('displayName') as string,
    phone: formData.get('phone') as string,
    whatsappNumber: formData.get('whatsappNumber') as string,
    city: formData.get('city') as string,
    serviceAreaText: formData.get('serviceAreaText') as string,
    vehicleType: formData.get('vehicleType') as string,
    languages: formData.get('languages') as string,
    bio: formData.get('bio') as string || undefined,
    availabilityStatus: (formData.get('availabilityStatus') as string) || 'AVAILABLE',
  }

  const validated = createDriverSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors
    }
  }

  try {
    await DriverService.createProfile(user.id, validated.data)
  } catch (error) {
    console.error('Create profile error:', error)
    return { error: 'Failed to create profile. Please try again.' }
  }

  redirect('/dashboard')
}
