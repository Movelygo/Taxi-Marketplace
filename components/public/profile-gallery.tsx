'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import type { DriverPhoto } from '@prisma/client'

interface ProfileGalleryProps {
  photos: DriverPhoto[]
  driverName: string
}

export function ProfileGallery({ photos, driverName }: ProfileGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isOpen = activeIndex !== null

  const close = useCallback(() => setActiveIndex(null), [])
  const next = useCallback(() => {
    setActiveIndex((prev) => (prev === null ? prev : (prev + 1) % photos.length))
  }, [photos.length])
  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev === null ? prev : (prev - 1 + photos.length) % photos.length))
  }, [photos.length])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, close, next, prev])

  if (photos.length === 0) return null

  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-4 bg-gray-50">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setActiveIndex(index)}
            className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 hover:ring-4 hover:ring-blue-500/20 transition-all group shadow-sm"
          >
            <Image
              src={photo.url}
              alt={`${driverName} vehicle photo ${index + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isOpen && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white text-xl"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Previous */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white text-xl"
              aria-label="Previous photo"
            >
              ←
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[activeIndex].url}
              alt={`${driverName} vehicle photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white text-xl"
              aria-label="Next photo"
            >
              →
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-sm font-medium">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
