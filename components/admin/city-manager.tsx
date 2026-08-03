'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import {
  getUSStates,
  getCitiesForState,
  activateCities,
  deactivateCities,
  type StateOption,
  type CityWithStatus,
} from '@/modules/cities/actions/city-catalog'
import type { City } from '@prisma/client'

interface CityManagerProps {
  initialCities: City[]
  defaultState?: string
}

export function CityManager({ initialCities, defaultState = 'MD' }: CityManagerProps) {
  const [selectedState, setSelectedState] = useState<string>(defaultState)
  const [cities, setCities] = useState<CityWithStatus[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set())

  // Load states on mount
  const [stateOptions, setStateOptions] = useState<StateOption[]>([])
  useEffect(() => {
    getUSStates().then(setStateOptions).catch(() => {})
  }, [])

  // Load cities when state changes
  useEffect(() => {
    setLoading(true)
    setMessage(null)
    getCitiesForState(selectedState)
      .then((data) => {
        setCities(data)
        setSelectedNames(new Set())
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load cities' }))
      .finally(() => setLoading(false))
  }, [selectedState])

  const filteredCities = useMemo(() => {
    if (!search.trim()) return cities
    const q = search.toLowerCase()
    return cities.filter((c) => c.name.toLowerCase().includes(q))
  }, [cities, search])

  const activeCount = cities.filter((c) => c.dbCity?.isActive).length
  const inactiveCount = cities.filter((c) => c.dbCity && !c.dbCity.isActive).length
  const notInDbCount = cities.filter((c) => !c.dbCity).length

  function toggleSelect(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function selectAllFiltered() {
    setSelectedNames(new Set(filteredCities.map((c) => c.name)))
  }

  function clearSelection() {
    setSelectedNames(new Set())
  }

  function handleBatchActivate() {
    if (selectedNames.size === 0) return
    const names = Array.from(selectedNames)
    startTransition(async () => {
      const result = await activateCities(names, selectedState)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: `${result.activatedCount} cities activated.` })
        // Refresh list
        const refreshed = await getCitiesForState(selectedState)
        setCities(refreshed)
        setSelectedNames(new Set())
      }
    })
  }

  function handleBatchDeactivate() {
    const dbIds = cities
      .filter((c) => c.dbCity && selectedNames.has(c.name))
      .map((c) => c.dbCity!.id)
    if (dbIds.length === 0) return
    startTransition(async () => {
      const result = await deactivateCities(dbIds)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: `${result.deactivatedCount} cities deactivated.` })
        const refreshed = await getCitiesForState(selectedState)
        setCities(refreshed)
        setSelectedNames(new Set())
      }
    })
  }

  function toggleSingle(city: CityWithStatus) {
    if (city.dbCity?.isActive) {
      // Deactivate
      startTransition(async () => {
        const result = await deactivateCities([city.dbCity!.id])
        if (result.error) {
          setMessage({ type: 'error', text: result.error })
        } else {
          setMessage({ type: 'success', text: `${city.name} deactivated.` })
          const refreshed = await getCitiesForState(selectedState)
          setCities(refreshed)
        }
      })
    } else {
      // Activate
      startTransition(async () => {
        const result = await activateCities([city.name], selectedState)
        if (result.error) {
          setMessage({ type: 'error', text: result.error })
        } else {
          setMessage({ type: 'success', text: `${city.name} activated.` })
          const refreshed = await getCitiesForState(selectedState)
          setCities(refreshed)
        }
      })
    }
  }

  // Summary of all active cities across states (from initialCities)
  const totalActiveAll = initialCities.filter((c) => c.isActive).length

  return (
    <div className="space-y-6">
      {/* State selector + summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">City Catalog</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalActiveAll} active cities across all states
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="state" className="text-sm font-medium text-gray-700">
              State:
            </label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={loading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] bg-white min-w-[180px]"
            >
              {stateOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats for current state */}
        {!loading && cities.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
              {activeCount} active
            </span>
            {inactiveCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {inactiveCount} inactive
              </span>
            )}
            {notInDbCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                {notInDbCount} available
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
              {cities.length} total in {selectedState}
            </span>
          </div>
        )}
      </div>

      {/* Search + batch actions */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          Loading cities...
        </div>
      ) : cities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No cities found for this state.
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              type="text"
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={selectAllFiltered}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Select all ({filteredCities.length})
              </button>
              {selectedNames.size > 0 && (
                <>
                  <span className="text-xs text-gray-500">{selectedNames.size} selected</span>
                  <button
                    onClick={handleBatchActivate}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Activate
                  </button>
                  <button
                    onClick={handleBatchDeactivate}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* City grid */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredCities.map((city) => {
                const isSelected = selectedNames.has(city.name)
                const isActive = city.dbCity?.isActive ?? false
                const hasDbEntry = !!city.dbCity

                return (
                  <div
                    key={city.name}
                    className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(city.name)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0B1F3D] focus:ring-[#0B1F3D]"
                    />

                    {/* Status dot */}
                    <span
                      className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        isActive ? 'bg-green-500' : hasDbEntry ? 'bg-gray-300' : 'bg-gray-100'
                      }`}
                    />

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{city.name}</p>
                      <p className="text-xs text-gray-400">
                        {isActive ? 'Active' : hasDbEntry ? 'Inactive' : 'Not added'}
                      </p>
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() => toggleSingle(city)}
                      disabled={busy}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        isActive
                          ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
