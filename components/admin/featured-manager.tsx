'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { moveFeatured } from '@/modules/admin/actions/reorder-featured'
import { toggleFeatured } from '@/modules/admin/actions/toggle-featured'
import type { Driver } from '@prisma/client'

interface FeaturedManagerProps {
  drivers: Driver[]
}

export function FeaturedManager({ drivers }: FeaturedManagerProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleMove = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      const result = await moveFeatured(id, direction)
      if (result?.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  const handleUnfeature = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the featured list?`)) return
    startTransition(async () => {
      const result = await toggleFeatured(id, false)
      if (result?.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <ul className="divide-y divide-gray-100">
      {drivers.map((driver, index) => (
        <li key={driver.id} className="px-4 sm:px-6 py-4 flex items-center gap-4">
          {/* Position number */}
          <div className="w-8 h-8 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center text-[#0B1F3D] font-bold text-sm flex-shrink-0">
            {index + 1}
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-[#0B1F3D]/5 flex-shrink-0">
            {driver.profileImageUrl ? (
              <Image
                src={driver.profileImageUrl}
                alt={driver.displayName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#0B1F3D] font-bold text-sm">
                {driver.displayName.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {driver.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {driver.city} · {driver.vehicleType}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleMove(driver.id, 'up')}
              disabled={isPending || index === 0}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move up"
              title="Move up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleMove(driver.id, 'down')}
              disabled={isPending || index === drivers.length - 1}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move down"
              title="Move down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Link
              href={`/admin/drivers/${driver.id}`}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => handleUnfeature(driver.id, driver.displayName)}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
