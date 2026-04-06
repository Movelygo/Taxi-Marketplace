'use client'

import { useState, useRef } from 'react'
import { uploadProfileImage } from '@/modules/drivers/actions/upload-profile-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  externalBusy?: boolean
  onUploadStateChange?: (uploading: boolean) => void
}

export function ProfileImageUpload({ currentImageUrl, externalBusy = false, onUploadStateChange }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSuccess(false)
    setError(null)

    // Client-side validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      setError(`File size must be less than 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.')
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // File is valid, show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (externalBusy) {
      setError('Please wait for the current action to complete.')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)
    onUploadStateChange?.(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await uploadProfileImage(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.imageUrl) {
        setSuccess(true)
        setSavedImageUrl(result.imageUrl)
        setPreviewUrl(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      onUploadStateChange?.(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile Image</CardTitle>
        <CardDescription>Upload your profile picture (max 5MB)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          {savedImageUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Current Profile Image</p>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={savedImageUrl}
                    alt="Current profile image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-600">Selected Image Preview</p>
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-blue-400">
                  <Image
                    src={previewUrl}
                    alt="Selected image preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              name="profileImage"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full text-sm"
              disabled={uploading || externalBusy}
              required
            />
          </div>

          {success && (
            <p className="text-sm text-green-600 font-medium">✓ Profile image uploaded successfully!</p>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {externalBusy && !uploading && (
            <p className="text-sm text-gray-600">Profile save in progress...</p>
          )}

          <Button type="submit" className="w-full" disabled={uploading || externalBusy}>
            {uploading ? 'Uploading...' : externalBusy ? 'Please wait...' : 'Upload Image'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
