'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '../services/driver.service'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadProfileImage(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const existingProfile = await DriverService.getProfile(user.id)
  if (!existingProfile) {
    return { error: 'Profile not found' }
  }

  const file = formData.get('profileImage') as File
  if (!file || file.size === 0) {
    return { error: 'No file selected' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size must be less than 5MB' }
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  try {
    const supabase = await createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `driver-profiles/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('driver-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('driver-images')
      .getPublicUrl(filePath)

    await DriverService.updateProfileImage(user.id, publicUrl)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/profile')
    return { success: true, imageUrl: publicUrl }
  } catch (error) {
    console.error('Upload profile image error:', error)
    return { error: 'Failed to upload image. Please try again.' }
  }
}
