'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { updateDriverSchema } from '../validations/driver.schema'
import { DriverService } from '../services/driver.service'
import { revalidatePath } from 'next/cache'

type UpdateProfileState = {
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
  success?: boolean
} | undefined

function getFormArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === 'string' && v.length > 0)
}

export async function updateProfile(_prevState: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const existingProfile = await DriverService.getProfile(user.id)
  if (!existingProfile) {
    return { error: 'Profile not found' }
  }

  const rawData: Record<string, string | string[] | undefined> = {}

  const displayName = formData.get('displayName') as string
  if (displayName) rawData.displayName = displayName

  const phone = formData.get('phone') as string
  if (phone) rawData.phone = phone

  const whatsappNumber = formData.get('whatsappNumber') as string
  if (whatsappNumber) rawData.whatsappNumber = whatsappNumber

  const city = formData.get('city') as string
  if (city) rawData.city = city

  const serviceAreaText = formData.get('serviceAreaText') as string
  if (serviceAreaText) rawData.serviceAreaText = serviceAreaText

  const vehicleType = formData.get('vehicleType') as string
  if (vehicleType) rawData.vehicleType = vehicleType

  rawData.vehicleMake = (formData.get('vehicleMake') as string) || undefined
  rawData.vehicleModel = (formData.get('vehicleModel') as string) || undefined
  rawData.vehicleYear = (formData.get('vehicleYear') as string) || undefined
  rawData.vehicleColor = (formData.get('vehicleColor') as string) || undefined
  rawData.passengerCapacity = (formData.get('passengerCapacity') as string) || undefined
  rawData.operatingHours = (formData.get('operatingHours') as string) || undefined

  rawData.amenities = getFormArray(formData, 'amenities')
  rawData.paymentMethods = getFormArray(formData, 'paymentMethods')

  const languages = formData.get('languages') as string
  if (languages) rawData.languages = languages

  const bio = formData.get('bio') as string
  if (bio !== null) rawData.bio = bio

  const availabilityStatus = formData.get('availabilityStatus') as string
  if (availabilityStatus) rawData.availabilityStatus = availabilityStatus

  const validated = updateDriverSchema.safeParse(rawData)

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors
    return { error: fieldErrors } as UpdateProfileState
  }

  try {
    await DriverService.updateProfile(user.id, validated.data)
    revalidatePath('/dashboard')
    revalidatePath(`/drivers/${existingProfile.slug}`)
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }
}
