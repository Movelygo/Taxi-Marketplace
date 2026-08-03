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

// Convert empty string or null to undefined — prevents sending empty strings
// for optional fields where the intent is "no change" or "leave empty"
function optionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)
  if (val === null) return undefined
  const str = (val as string).trim()
  return str || undefined
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

  rawData.vehicleMake = optionalString(formData, 'vehicleMake')
  rawData.vehicleModel = optionalString(formData, 'vehicleModel')
  rawData.vehicleYear = optionalString(formData, 'vehicleYear')
  rawData.vehicleColor = optionalString(formData, 'vehicleColor')
  rawData.passengerCapacity = optionalString(formData, 'passengerCapacity')
  rawData.operatingHours = optionalString(formData, 'operatingHours')

  rawData.amenities = getFormArray(formData, 'amenities')
  rawData.paymentMethods = getFormArray(formData, 'paymentMethods')

  const languages = formData.get('languages') as string
  if (languages) rawData.languages = languages

  // Bio: allow clearing (empty string is valid), but don't send if field is absent
  const bio = formData.get('bio')
  if (bio !== null) rawData.bio = (bio as string).trim() || undefined

  const availabilityStatus = formData.get('availabilityStatus') as string
  if (availabilityStatus) rawData.availabilityStatus = availabilityStatus

  const validated = updateDriverSchema.safeParse(rawData)

  if (!validated.success) {
    const fieldErrors = validated.error.flatten().fieldErrors
    console.error('[updateProfile] Validation failed:', {
      fieldErrors,
      rawDataKeys: Object.keys(rawData),
    })
    return { error: fieldErrors } as UpdateProfileState
  }

  try {
    await DriverService.updateProfile(user.id, validated.data)
    revalidatePath('/dashboard')
    revalidatePath(`/drivers/${existingProfile.slug}`)
    return { success: true }
  } catch (error) {
    console.error('[updateProfile] Server error:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }
}
