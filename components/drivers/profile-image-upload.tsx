'use client'

import { useState, useRef } from 'react'
import { uploadProfileImage } from '@/modules/drivers/actions/upload-profile-image'
import Image from 'next/image'
import { 
  User, 
  Upload, 
  Loader2
} from '@/components/ui/icons'

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
      setError(`Max 5MB. File is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP.')
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (externalBusy) return
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
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch {
      setError('Upload failed.')
    } finally {
      setUploading(false)
      onUploadStateChange?.(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2.5 mb-1.5 text-[#0B1F3D]">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight">Profile Photo</h2>
        </div>
        <p className="text-sm font-medium text-gray-500">Your primary profile image</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 bg-gray-50 shadow-lg transition-all ${previewUrl ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-white'}`}>
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : savedImageUrl ? (
                  <Image src={savedImageUrl} alt="Current" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#0B1F3D]">
                    <User className="w-10 h-10 opacity-20" />
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#0B1F3D] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            {previewUrl && (
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                Pending save
              </p>
            )}
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold text-center border border-green-100">
                Updated!
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading || externalBusy || !previewUrl}
              className="w-full py-2.5 bg-[#0B1F3D] text-white rounded-xl font-black text-xs hover:bg-[#001F3F] transition-all transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
            >
              Save Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
