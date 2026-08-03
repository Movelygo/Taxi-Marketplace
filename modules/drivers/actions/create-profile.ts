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
    vehicleMake?: string[]
    vehicleModel?: string[]
    vehicleYear?: string[]
    vehicleColor?: string[]
    passengerCapacity?: string[]
    operatingHours?: string[]
    languages?: string[]
    bio?: string[]
  } | string
} | undefined

function getFormArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === 'string' && v.length > 0)
}

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
    vehicleMake: (formData.get('vehicleMake') as string) || undefined,
    vehicleModel: (formData.get('vehicleModel') as string) || undefined,
    vehicleYear: (formData.get('vehicleYear') as string) || undefined,
    vehicleColor: (formData.get('vehicleColor') as string) || undefined,
    passengerCapacity: (formData.get('passengerCapacity') as string) || undefined,
    amenities: getFormArray(formData, 'amenities'),
    paymentMethods: getFormArray(formData, 'paymentMethods'),
    operatingHours: (formData.get('operatingHours') as string) || undefined,
    languages: formData.get('languages') as string,
    bio: formData.get('bio') as string || undefined,
    availabilityStatus: (formData.get('availabilityStatus') as string) || 'AVAILABLE',
  }

  const validated = createDriverSchema.safeParse(rawData)

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors
    return { error: fieldErrors } as CreateProfileState
  }

  try {
    await DriverService.createProfile(user.id, validated.data)
  } catch (error) {
    console.error('Create profile error:', error)
    return { error: 'Failed to create profile. Please try again.' }
  }

  redirect('/dashboard')
}
