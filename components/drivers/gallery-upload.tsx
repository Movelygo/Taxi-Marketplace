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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2 mb-1 text-[#0B1F3D]">
          <Car className="w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight">Vehicle Gallery</h2>
        </div>
        <p className="text-sm font-medium text-gray-500">
          {localPhotos.length} / {limit} slots used
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Photo grid */}
        {localPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {localPhotos.map((photo, index) => (
              <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                <div className="relative aspect-video">
                  <Image
                    src={photo.url}
                    alt={`Vehicle photo ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 'left')}
                        disabled={index === 0}
                        className="w-6 h-6 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 'right')}
                        disabled={index === localPhotos.length - 1}
                        className="w-6 h-6 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      {confirmDelete === photo.id ? (
                        <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 shadow-xl">
                          <button
                            type="button"
                            onClick={() => handleDelete(photo.id)}
                            className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded-md"
                          >
                            Del
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(photo.id)}
                          className="w-6 h-6 bg-red-500/20 hover:bg-red-500 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    {index === 0 ? (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                        Cover
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-md backdrop-blur-md">
                        #{index + 1}
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
              className="group relative w-full py-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#0B1F3D]/20 hover:bg-blue-50/30 transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0B1F3D] group-hover:text-white transition-all">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </div>
              <div className="text-center px-2">
                <p className="text-sm font-black text-gray-900 tracking-tight">
                  {uploading ? 'Uploading...' : 'Add photo'}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {remaining} remaining
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <Info className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Limit reached</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 font-bold text-xs">
            <Info className="w-3 h-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
