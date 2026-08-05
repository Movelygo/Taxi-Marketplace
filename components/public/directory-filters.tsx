'use client'

import { SearchableSelect } from '@/components/ui/searchable-select'
import { VEHICLE_CATEGORIES } from '@/modules/drivers/constants/profile-attributes'
import type { City, ProfileAttribute } from '@prisma/client'

export interface FilterState {
  q: string
  city: string
  vehicleType: string
  amenities: string[]
  paymentMethods: string[]
  minCapacity: string
  availabilityStatus: string
  sort: 'featured' | 'newest' | 'rating'
  pickup: string
  destination: string
  exactRoute: boolean
}

interface DirectoryFiltersProps {
  cities: City[]
  amenities: ProfileAttribute[]
  paymentMethods: ProfileAttribute[]
  currentFilters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
}

export function DirectoryFilters({
  cities,
  amenities,
  paymentMethods,
  currentFilters,
  onFiltersChange,
  onReset,
}: DirectoryFiltersProps) {
  const update = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...currentFilters, ...partial })
  }

  const toggleArrayFilter = (key: 'amenities' | 'paymentMethods', value: string) => {
    const current = currentFilters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    update({ [key]: next })
  }

  const activeFilterCount =
    (currentFilters.q ? 1 : 0) +
    (currentFilters.city ? 1 : 0) +
    (currentFilters.vehicleType ? 1 : 0) +
    currentFilters.amenities.length +
    currentFilters.paymentMethods.length +
    (currentFilters.minCapacity ? 1 : 0) +
    (currentFilters.availabilityStatus ? 1 : 0) +
    (currentFilters.pickup ? 1 : 0) +
    (currentFilters.destination ? 1 : 0)

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Search
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={currentFilters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Name, vehicle, service area..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
          />
        </div>
      </div>

      {/* Trip Intent — Pickup / Destination */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Trip Route (optional)
          </label>
          <p className="text-xs text-gray-400 mb-3">Filter drivers who serve your route</p>
        </div>
        <SearchableSelect
          name="filter-pickup"
          value={currentFilters.pickup}
          placeholder="Pickup city"
          options={[
            { value: '', label: 'Any pickup' },
            ...cities.map((c) => ({ value: c.name, label: c.name, sublabel: c.state })),
          ]}
          onChange={(value) => update({ pickup: value })}
        />
        <SearchableSelect
          name="filter-destination"
          value={currentFilters.destination}
          placeholder="Destination city"
          options={[
            { value: '', label: 'Any destination' },
            ...cities.map((c) => ({ value: c.name, label: c.name, sublabel: c.state })),
          ]}
          onChange={(value) => update({ destination: value })}
        />
        {currentFilters.pickup && currentFilters.destination && (
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={currentFilters.exactRoute}
              onChange={(e) => update({ exactRoute: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#0B1F3D] focus:ring-[#0B1F3D]"
            />
            Exact route only (both cities)
          </label>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          City
        </label>
        <SearchableSelect
          name="filter-city"
          value={currentFilters.city}
          placeholder="All cities"
          options={[
            { value: '', label: 'All cities' },
            ...cities.map((c) => ({ value: c.name, label: c.name, sublabel: c.state })),
          ]}
          onChange={(value) => update({ city: value })}
        />
      </div>

      {/* Vehicle type */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Vehicle Type
        </label>
        <select
          value={currentFilters.vehicleType}
          onChange={(e) => update({ vehicleType: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
        >
          <option value="">All types</option>
          {VEHICLE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Availability
        </label>
        <select
          value={currentFilters.availabilityStatus}
          onChange={(e) => update({ availabilityStatus: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
        >
          <option value="">Any status</option>
          <option value="AVAILABLE">Available now</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Min capacity */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Min. Passengers
        </label>
        <select
          value={currentFilters.minCapacity}
          onChange={(e) => update({ minCapacity: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="4">4+</option>
          <option value="6">6+</option>
          <option value="8">8+</option>
        </select>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Amenities
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {amenities.map((a) => (
              <label key={a.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded">
                <input
                  type="checkbox"
                  checked={currentFilters.amenities.includes(a.key)}
                  onChange={() => toggleArrayFilter('amenities', a.key)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0B1F3D] focus:ring-[#0B1F3D]"
                />
                <span className="text-sm text-gray-700">{a.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Payment methods */}
      {paymentMethods.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Payment Methods
          </label>
          <div className="space-y-1.5">
            {paymentMethods.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded">
                <input
                  type="checkbox"
                  checked={currentFilters.paymentMethods.includes(p.key)}
                  onChange={() => toggleArrayFilter('paymentMethods', p.key)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0B1F3D] focus:ring-[#0B1F3D]"
                />
                <span className="text-sm text-gray-700">{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button
          onClick={onReset}
          className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  )
}
