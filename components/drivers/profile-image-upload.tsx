'use client'

import { useState, useRef } from 'react'
import { uploadProfileImage } from '@/modules/drivers/actions/upload-profile-image'
import Image from 'next/image'
import { 
  User, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  Info 
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
      setError(`File size must be less than 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.')
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      onUploadStateChange?.(false)
    }
  }

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2.5 mb-1.5 text-[#0B1F3D]">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight">Profile Photo</h2>
        </div>
        <p className="text-sm font-medium text-gray-500">Upload your professional picture (max 5MB)</p>
      </div>

      <div className="p-8">
        <form onSubmit={handleUpload} className="space-y-8">
          
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className={`relative w-40 h-40 rounded-[40px] overflow-hidden border-4 bg-gray-50 shadow-xl transition-all ${previewUrl ? 'border-blue-500 ring-8 ring-blue-500/10' : 'border-white'}`}>
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : savedImageUrl ? (
                  <Image src={savedImageUrl} alt="Current" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#0B1F3D]">
                    <User className="w-16 h-16 opacity-20" />
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#0B1F3D] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group-hover:rotate-6"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            {previewUrl && (
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                New selection pending upload
              </p>
            )}
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              name="profileImage"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading || externalBusy}
            />

            {success && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <p>Profile photo updated!</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-sm">
                <Info className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading || externalBusy || !previewUrl}
              className="w-full py-4 bg-[#0B1F3D] text-white rounded-2xl font-black text-sm hover:bg-[#001F3F] transition-all transform active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-[#0B1F3D]/20"
            >
              {uploading ? 'Uploading...' : 'Save Profile Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
