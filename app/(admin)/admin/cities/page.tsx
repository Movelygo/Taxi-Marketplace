import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { CityService } from '@/modules/cities/services/city.service'
import { CityManager } from '@/components/admin/city-manager'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminCitiesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/dashboard')

  const cities = await CityService.getAll()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userEmail={user.email} />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Cities</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage the cities that drivers can select and customers can filter by.
              Inactive cities are hidden from the public site but existing drivers keep their assignment.
            </p>
          </div>

          <CityManager cities={cities} />
        </div>
      </main>
    </div>
  )
}
