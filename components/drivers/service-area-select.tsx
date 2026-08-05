'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Search, MapPin, Check } from '@/components/ui/icons'
import type { City } from '@prisma/client'

interface ServiceAreaSelectProps {
  cities: City[]
  selectedCityIds: string[]
  driverCityId?: string | null
  driverCityName?: string
  onChange?: (cityIds: string[]) => void
}

interface GroupedCities {
  label: string
  cities: City[]
}

export function ServiceAreaSelect({
  cities,
  selectedCityIds,
  driverCityId,
  driverCityName,
}: ServiceAreaSelectProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedCityIds)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine driver's home state
  const driverCity = cities.find(c => c.id === driverCityId) || cities.find(c => c.name.toLowerCase() === (driverCityName || '').toLowerCase())
  const driverState = driverCity?.state || 'MD'

  // Group cities: home state first, then other states
  const grouped = useMemo<GroupedCities[]>(() => {
    const filtered = cities.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
    )

    const homeStateCities = filtered
      .filter(c => c.state === driverState)
      .sort((a, b) => a.name.localeCompare(b.name))

    const otherStateCities = filtered
      .filter(c => c.state !== driverState)
      .sort((a, b) => {
        if (a.state !== b.state) return a.state.localeCompare(b.state)
        return a.name.localeCompare(b.name)
      })

    const groups: GroupedCities[] = []

    if (homeStateCities.length > 0) {
      groups.push({ label: `${driverState} (Your state)`, cities: homeStateCities })
    }
    if (otherStateCities.length > 0) {
      // Group by state
      const byState = new Map<string, City[]>()
      for (const c of otherStateCities) {
        if (!byState.has(c.state)) byState.set(c.state, [])
        byState.get(c.state)!.push(c)
      }
      for (const [state, stateCities] of byState) {
        groups.push({ label: state, cities: stateCities })
      }
    }

    return groups
  }, [cities, search, driverState])

  // Close on click outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggleCity = (cityId: string) => {
    setInternalSelected(prev => {
      const next = prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
      return next
    })
  }

  const removeCity = (cityId: string) => {
    setInternalSelected(prev => prev.filter(id => id !== cityId))
  }

  const selectedCities = cities.filter(c => internalSelected.includes(c.id))

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips */}
      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedCities.map(city => (
            <span
              key={city.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B1F3D]/5 border border-[#0B1F3D]/10 rounded-lg text-xs font-semibold text-[#0B1F3D]"
            >
              <MapPin className="w-3 h-3" />
              {city.name}
              <button
                type="button"
                onClick={() => removeCity(city.id)}
                className="ml-0.5 hover:text-red-500 transition-colors"
                aria-label={`Remove ${city.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedCities.length > 0 ? 'Add more cities...' : 'Search cities to add...'}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]/10 focus:border-[#0B1F3D]"
        />
      </div>

      {/* Hidden inputs for form submission */}
      {internalSelected.map(cityId => (
        <input key={cityId} type="hidden" name="serviceAreaCityIds" value={cityId} />
      ))}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {grouped.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">No cities found</div>
          ) : (
            grouped.map(group => (
              <div key={group.label}>
                <div className="px-3 py-1.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0">
                  {group.label}
                </div>
                {group.cities.map(city => {
                  const isSelected = internalSelected.includes(city.id)
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        isSelected ? 'bg-[#0B1F3D]/5 text-[#0B1F3D] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {city.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#0B1F3D]" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
