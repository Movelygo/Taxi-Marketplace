'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { uploadGalleryPhoto, deleteGalleryPhoto, reorderGalleryPhotos } from '@/modules/gallery/actions/gallery-actions'
import { 
  Car, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Plus,
  Loader2,
  Info
} from '@/components/ui/icons'
import type { DriverPhoto } from '@prisma/client'

interface GalleryUploadProps {
  photos: DriverPhoto[]
  limit: number
}

export function GalleryUpload({ photos, limit }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState<DriverPhoto[]>(photos)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const remaining = limit - localPhotos.length

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      const result = await uploadGalleryPhoto(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.photoId && result.url) {
        setLocalPhotos((prev) => [
          ...prev,
          { id: result.photoId!, url: result.url!, driverId: '', sortOrder: prev.length, createdAt: new Date() },
        ])
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    setError(null)
    const result = await deleteGalleryPhoto(photoId)
    if (result.error) {
      setError(result.error)
    } else {
      setLocalPhotos((prev) => prev.filter((p) => p.id !== photoId))
    }
    setConfirmDelete(null)
  }

  const movePhoto = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localPhotos.length) return

    const reordered = [...localPhotos]
    ;[reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]]

    setLocalPhotos(reordered)
    startTransition(() => {
      reorderGalleryPhotos(reordered.map((p) => p.id))
    })
  }

  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 lg:p-10 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2.5 mb-1.5 text-[#0B1F3D]">
          <Car className="w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight">Vehicle Gallery</h2>
        </div>
        <p className="text-sm font-medium text-gray-500">
          {localPhotos.length} of {limit} photos used · JPG, PNG, or WebP — max 5MB
        </p>
      </div>

      <div className="p-8 lg:p-10 space-y-8">
        {/* Photo grid */}
        {localPhotos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localPhotos.map((photo, index) => (
              <div key={photo.id} className="relative group rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                <div className="relative aspect-video">
                  <Image
                    src={photo.url}
                    alt={`Vehicle photo ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-between items-start">
                    {/* Order controls */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 'left')}
                        disabled={index === 0}
                        className="w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                        aria-label="Move left"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 'right')}
                        disabled={index === localPhotos.length - 1}
                        className="w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                        aria-label="Move right"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete */}
                    <div>
                      {confirmDelete === photo.id ? (
                        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-xl animate-in zoom-in-95 duration-200">
                          <button
                            type="button"
                            onClick={() => handleDelete(photo.id)}
                            className="px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-gray-200"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(photo.id)}
                          className="w-8 h-8 bg-red-500/20 hover:bg-red-500 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-colors"
                          aria-label="Delete photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order badge */}
                  <div>
                    {index === 0 ? (
                      <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                        Cover Photo
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md">
                        Photo {index + 1}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {remaining > 0 ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative w-full py-12 border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#0B1F3D]/20 hover:bg-blue-50/30 transition-all disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0B1F3D] group-hover:text-white transition-all shadow-sm">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Plus className="w-8 h-8" />
                )}
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-black text-gray-900 tracking-tight">
                  {uploading ? 'Uploading...' : 'Add vehicle photos'}
                </p>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Click to browse · {remaining} slots remaining
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 text-center">
            <Info className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Photo limit reached</h3>
            <p className="text-sm font-medium text-gray-500 mt-1 max-w-xs mx-auto">
              Remove a photo to add a new one. Pro accounts get up to 7 photos.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-sm shadow-sm">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
