'use client'

import { SearchableSelect } from '@/components/ui/searchable-select'
import type { City } from '@prisma/client'

interface CityFilterProps {
  cities: City[]
  selectedCity?: string
}

export function CityFilter({ cities, selectedCity }: CityFilterProps) {
  return (
    <div className="flex gap-2">
      <SearchableSelect
        id="city"
        name="city"
        defaultValue={selectedCity || ''}
        placeholder="All cities"
        options={[
          { value: '', label: 'All cities' },
          ...cities.map((c) => ({
            value: c.name,
            label: c.name,
            sublabel: c.state,
          })),
        ]}
        className="flex-1"
      />
      <button
        type="submit"
        className="px-4 py-2.5 bg-[#0B1F3D] text-white rounded-lg font-semibold text-sm hover:bg-[#001F3F] transition-colors"
      >
        Apply
      </button>
    </div>
  )
}
