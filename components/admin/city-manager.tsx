'use client'

import { useActionState, useState } from 'react'
import { createCity, updateCityAction, deleteCityAction } from '@/modules/cities/actions/manage-city'
import type { CityState } from '@/modules/cities/actions/types'
import type { City } from '@prisma/client'

const initialState: CityState = {}

export function CityManager({ cities }: { cities: City[] }) {
  const [state, formAction] = useActionState<CityState, FormData>(createCity, initialState)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Add city form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add a city</h2>
        <form action={formAction} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
              City name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Silver Spring"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3D]"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-red-600 mt-1">{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div className="sm:w-32">
            <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F3D] bg-white"
            >
              <option value="MD">Maryland</option>
              <option value="DC">Washington DC</option>
              <option value="VA">Virginia</option>
            </select>
            {state.fieldErrors?.state && (
              <p className="text-xs text-red-600 mt-1">{state.fieldErrors.state[0]}</p>
            )}
          </div>
          <div className="sm:self-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#0B1F3D] text-white text-sm font-semibold rounded-lg hover:bg-[#0B1F3D]/90 transition-colors"
            >
              Add city
            </button>
          </div>
        </form>
        {state.error && !state.fieldErrors && (
          <p className="text-xs text-red-600 mt-2">{state.error}</p>
        )}
        {state.success && (
          <p className="text-xs text-green-600 mt-2">City added successfully.</p>
        )}
      </div>

      {/* City list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Cities ({cities.length})
          </h2>
        </div>
        {cities.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No cities yet. Add your first city above.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cities.map((city) => (
              <div key={city.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full">
                    <span className={`block w-2 h-2 rounded-full ${city.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {city.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {city.state} · slug: {city.slug} · {city.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <form action={updateCityAction} className="inline">
                    <input type="hidden" name="id" value={city.id} />
                    <input type="hidden" name="isActive" value={(!city.isActive).toString()} />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        city.isActive
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {city.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                  {confirmDelete === city.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          await deleteCityAction(city.id)
                          setConfirmDelete(null)
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(city.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
