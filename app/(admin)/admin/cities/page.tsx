import { CityService } from '@/modules/cities/services/city.service'
import { getUSStates } from '@/modules/cities/actions/city-catalog'
import { CityManager } from '@/components/admin/city-manager'

export const metadata = {
  title: 'Cities | Movely Admin',
  description: 'Manage cities available to drivers and customers',
}

export const dynamic = 'force-dynamic'

export default async function AdminCitiesPage() {
  const [cities, states] = await Promise.all([
    CityService.getAll(),
    getUSStates(),
  ])

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Cities</h1>
          <p className="text-gray-600 mt-1">
            Select a state to browse all available cities. Activate the ones where Movely operates.
            Inactive cities are hidden from the public site but existing drivers keep their assignment.
          </p>
        </div>
      </div>

      <div className="p-8">
        <CityManager initialCities={cities} states={states} defaultState="MD" />
      </div>
    </div>
  )
}
