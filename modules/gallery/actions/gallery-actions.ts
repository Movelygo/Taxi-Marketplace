'use server'

import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { GalleryService } from '../services/gallery.service'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadGalleryPhoto(formData: FormData): Promise<{ error?: string; success?: boolean; photoId?: string; url?: string }> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await DriverService.getProfile(user.id)
  if (!profile) return { error: 'Profile not found' }

  const file = formData.get('photo') as File
  if (!file || file.size === 0) return { error: 'No file selected' }
  if (file.size > MAX_SIZE) return { error: 'File size must be less than 5MB' }
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Only JPEG, PNG, and WebP images are allowed' }

  try {
    const supabase = await createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-gallery-${Date.now()}.${fileExt}`
    const filePath = `driver-gallery/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('driver-images')
      .upload(filePath, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('Gallery upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('driver-images')
      .getPublicUrl(filePath)

    const photo = await GalleryService.addPhoto(profile.id, publicUrl)

    revalidatePath('/dashboard/profile')
    revalidatePath(`/drivers/${profile.slug}`)
    return { success: true, photoId: photo.id, url: publicUrl }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to upload photo'
    return { error: msg }
  }
}

export async function deleteGalleryPhoto(photoId: string): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await DriverService.getProfile(user.id)
  if (!profile) return { error: 'Profile not found' }

  try {
    await GalleryService.deletePhoto(photoId)
    revalidatePath('/dashboard/profile')
    revalidatePath(`/drivers/${profile.slug}`)
    return { success: true }
  } catch {
    return { error: 'Failed to delete photo' }
  }
}

export async function reorderGalleryPhotos(photoIds: string[]): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await DriverService.getProfile(user.id)
  if (!profile) return { error: 'Profile not found' }

  try {
    await GalleryService.reorderPhotos(photoIds)
    revalidatePath('/dashboard/profile')
    revalidatePath(`/drivers/${profile.slug}`)
    return { success: true }
  } catch {
    return { error: 'Failed to reorder photos' }
  }
}
