'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { uploadGalleryPhoto, deleteGalleryPhoto, reorderGalleryPhotos } from '@/modules/gallery/actions/gallery-actions'
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Vehicle Gallery</h2>
        <p className="text-sm text-gray-600 mt-1">
          {localPhotos.length} of {limit} photos used · JPG, PNG, or WebP — max 5MB
        </p>
      </div>
      <div className="p-6 space-y-4">
        {/* Photo grid */}
        {localPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {localPhotos.map((photo, index) => (
              <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                <div className="relative aspect-video">
                  <Image
                    src={photo.url}
                    alt={`Vehicle photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>

                {/* Order controls */}
                <div className="absolute top-1 left-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 'left')}
                    disabled={index === 0}
                    className="w-6 h-6 bg-white/90 rounded text-xs font-bold text-gray-700 disabled:opacity-30 hover:bg-white"
                    aria-label="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 'right')}
                    disabled={index === localPhotos.length - 1}
                    className="w-6 h-6 bg-white/90 rounded text-xs font-bold text-gray-700 disabled:opacity-30 hover:bg-white"
                    aria-label="Move right"
                  >
                    →
                  </button>
                </div>

                {/* Delete */}
                <div className="absolute top-1 right-1">
                  {confirmDelete === photo.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-bold rounded hover:bg-white"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(photo.id)}
                      className="w-6 h-6 bg-white/90 rounded text-xs font-bold text-red-600 hover:bg-white"
                      aria-label="Delete photo"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Order badge */}
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#0B1F3D]/90 text-white text-xs font-medium rounded">
                    Cover
                  </div>
                )}
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
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-[#0B1F3D] hover:text-[#0B1F3D] transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `+ Add photo (${remaining} left)`}
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 py-3">
            Photo limit reached. Remove a photo to add a new one.
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
