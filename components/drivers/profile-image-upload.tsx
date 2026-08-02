'use client'

import { useState, useRef } from 'react'
import { uploadProfileImage } from '@/modules/drivers/actions/upload-profile-image'
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Profile Image</h2>
        <p className="text-sm text-gray-600 mt-1">Upload your profile picture (JPG, PNG, or WebP - max 5MB)</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          {savedImageUrl && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">Current Profile Image</p>
              <div className="flex justify-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
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
            <div className="space-y-3">
              <p className="text-sm font-semibold text-blue-600">New Image Preview</p>
              <div className="flex justify-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
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
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select New Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              name="profileImage"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50 file:cursor-pointer cursor-pointer"
              disabled={uploading || externalBusy}
              required
            />
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">✓ Profile image uploaded successfully!</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {externalBusy && !uploading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Profile save in progress...</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full px-6 py-3 bg-[#0B1F3D] text-white rounded-lg font-semibold hover:bg-[#001F3F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || externalBusy}
          >
            {uploading ? 'Uploading...' : externalBusy ? 'Please wait...' : 'Upload Image'}
          </button>
        </form>
      </div>
    </div>
  )
}
