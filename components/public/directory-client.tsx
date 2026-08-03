'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DirectoryFilters, type FilterState } from './directory-filters'
import { DriverCard } from './driver-card'
import { DriverGridSkeleton } from './driver-card-skeleton'
import { Pagination } from './pagination'
import type { DriverSearchResult, DriverSearchResultItem } from '@/modules/drivers/types/search'
import type { City, ProfileAttribute } from '@prisma/client'
import Link from 'next/link'

interface DirectoryClientProps {
  cities: City[]
  amenities: ProfileAttribute[]
  paymentMethods: ProfileAttribute[]
  initialDrivers: DriverSearchResultItem[]
  initialTotal: number
  initialPage: number
  initialPageSize: number
  initialFilters: FilterState
}

const EMPTY_FILTERS: FilterState = {
  q: '',
  city: '',
  vehicleType: '',
  amenities: [],
  paymentMethods: [],
  minCapacity: '',
  availabilityStatus: '',
  sort: 'featured',
}

function filtersToParams(filters: FilterState, page: number): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.city) params.set('city', filters.city)
  if (filters.vehicleType) params.set('vehicleType', filters.vehicleType)
  if (filters.minCapacity) params.set('minCapacity', filters.minCapacity)
  if (filters.availabilityStatus) params.set('availabilityStatus', filters.availabilityStatus)
  if (filters.sort !== 'featured') params.set('sort', filters.sort)
  filters.amenities.forEach((a) => params.append('amenities', a))
  filters.paymentMethods.forEach((p) => params.append('paymentMethods', p))
  if (page > 1) params.set('page', String(page))
  return params
}

export function DirectoryClient({
  cities,
  amenities,
  paymentMethods,
  initialDrivers,
  initialTotal,
  initialPage,
  initialPageSize,
  initialFilters,
}: DirectoryClientProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [drivers, setDrivers] = useState<DriverSearchResultItem[]>(initialDrivers)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Ref to track the latest fetch request and cancel stale ones
  const fetchIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isInitialRenderRef = useRef(true)

  const totalPages = Math.ceil(total / pageSize)

  // Single fetch function — called on filter/page change
  const fetchDrivers = useCallback(
    async (currentFilters: FilterState, currentPage: number) => {
      // Increment fetch ID to invalidate any in-flight requests
      const fetchId = ++fetchIdRef.current
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      setLoading(true)
      setError(null)

      const params = filtersToParams(currentFilters, currentPage)

      // Update URL silently for shareability (no navigation, no re-render)
      const qs = params.toString()
      const newUrl = qs ? `/drivers?${qs}` : '/drivers'
      window.history.replaceState(window.history.state, '', newUrl)

      try {
        const res = await fetch(`/api/drivers/search?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.error || 'Search is temporarily unavailable. Please try again.')
        if (!data || !Array.isArray(data.drivers)) throw new Error('Search returned an invalid response.')

        // Only apply results if this is still the latest fetch
        if (fetchId === fetchIdRef.current) {
          const result = data as DriverSearchResult
          setDrivers(result.drivers)
          setTotal(result.total)
          setPage(result.page)
          setPageSize(result.pageSize)
        }
      } catch (fetchError) {
        if (fetchId === fetchIdRef.current && !controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Search failed')
        }
      } finally {
        if (fetchId === fetchIdRef.current) {
          abortControllerRef.current = null
          setLoading(false)
        }
      }
    },
    [],
  )

  // Debounced fetch when filters change (NOT page — page changes fetch immediately)
  useEffect(() => {
    // Skip the initial mount — data already comes from server
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false
      return
    }

    const handler = setTimeout(() => {
      fetchDrivers(filters, 1)
    }, 350)

    return () => clearTimeout(handler)
  }, [filters, fetchDrivers])

  useEffect(() => () => abortControllerRef.current?.abort(), [])

  // Handle filter changes — always reset to page 1
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    fetchIdRef.current += 1
    setError(null)
    setLoading(false)
    setFilters(newFilters)
    setPage(1)
  }, [])

  // Handle reset
  const handleReset = useCallback(() => {
    handleFiltersChange(EMPTY_FILTERS)
  }, [handleFiltersChange])

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage)
    fetchDrivers(filters, nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchDrivers, filters])

  const activeFilterCount =
    (filters.q ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.vehicleType ? 1 : 0) +
    filters.amenities.length +
    filters.paymentMethods.length +
    (filters.minCapacity ? 1 : 0) +
    (filters.availabilityStatus ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Mobile filter toggle + sort */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#0B1F3D] text-white text-xs rounded-full">{activeFilterCount}</span>
          )}
        </button>

        {/* Sort dropdown */}
        <select
          value={filters.sort}
          onChange={(e) => handleFiltersChange({ ...filters, sort: e.target.value as 'featured' | 'newest' })}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
        >
          <option value="featured">Featured first</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Filters</h2>
                {/* Sort */}
                <select
                  value={filters.sort}
                  onChange={(e) => handleFiltersChange({ ...filters, sort: e.target.value as 'featured' | 'newest' })}
                  className="text-xs px-2 py-1 border border-gray-200 rounded text-gray-600"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <DirectoryFilters
                cities={cities}
                amenities={amenities}
                paymentMethods={paymentMethods}
                currentFilters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <strong className="text-gray-900">{total}</strong> driver{total !== 1 ? 's' : ''}
                  {filters.city && ` in ${filters.city}`}
                </>
              )}
            </p>
          </div>

          {error && drivers.length > 0 && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span>{error} Showing the previous results.</span>
              <button
                type="button"
                onClick={() => fetchDrivers(filters, page)}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <DriverGridSkeleton count={6} />
          ) : error && drivers.length === 0 ? (
            <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Search temporarily unavailable</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => fetchDrivers(filters, page)}
                className="inline-flex items-center px-4 py-2 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F]"
              >
                Try again
              </button>
            </div>
          ) : drivers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No drivers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}

                {/* Join card */}
                <article className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[300px] hover:border-[#0B1F3D] hover:bg-gray-50 transition-all">
                  <div className="w-12 h-12 rounded-lg bg-[#0B1F3D]/5 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#0B1F3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Are you a driver?</h3>
                  <p className="text-sm text-gray-600 mb-5 max-w-[220px]">
                    List your service for free and connect with customers in your area.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0B1F3D] text-white rounded-lg text-sm font-semibold hover:bg-[#001F3F] transition-colors"
                  >
                    Create Profile
                  </Link>
                </article>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <DirectoryFilters
                cities={cities}
                amenities={amenities}
                paymentMethods={paymentMethods}
                currentFilters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#0B1F3D] text-white rounded-lg font-semibold text-sm hover:bg-[#001F3F]"
              >
                Show {total} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
