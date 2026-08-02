'use client'

import { DriverStatus } from '@prisma/client'

interface DriverFiltersProps {
  statusFilter?: DriverStatus
}

export function DriverFilters({ statusFilter }: DriverFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, license, or vehicle ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none"
            disabled
          />
        </div>

        {/* Status Filter */}
        <select 
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none bg-white min-w-[150px]"
          value={statusFilter || ''}
          onChange={(e) => {
            const value = e.target.value
            if (value) {
              window.location.href = `/admin/drivers?status=${value}`
            } else {
              window.location.href = '/admin/drivers'
            }
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        {/* Filter Icon Button */}
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
