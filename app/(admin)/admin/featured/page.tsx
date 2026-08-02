import { AdminService } from '@/modules/admin/services/admin.service'
import { DriverService } from '@/modules/drivers/services/driver.service'
import Link from 'next/link'
import { FeaturedManager } from '@/components/admin/featured-manager'

export const metadata = {
  title: 'Featured Drivers | Admin',
  description: 'Manage homepage featured driver visibility and order',
}

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const featured = await AdminService.getFeaturedDrivers()
  const candidates = await DriverService.getPublicDrivers() // all approved

  // Drivers approved but not currently featured — eligible to be added
  const featuredIds = new Set(featured.map((d) => d.id))
  const available = candidates.filter((d) => !featuredIds.has(d.id))

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured drivers</h1>
            <p className="text-gray-600 mt-1">
              Control which drivers appear in the homepage featured section and the order they show in.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 max-w-5xl">
        {/* Currently featured */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Currently featured</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {featured.length} of 6 recommended slots used. Use the arrows to reorder.
              </p>
            </div>
          </div>
          {featured.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No featured drivers yet. Add one from the list below.
            </div>
          ) : (
            <FeaturedManager drivers={featured} />
          )}
        </section>

        {/* Available to feature */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Available approved drivers</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Approved drivers not currently featured. Toggle from the driver detail page.
            </p>
          </div>
          {available.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              All approved drivers are currently featured.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {available.slice(0, 20).map((driver) => (
                <li key={driver.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {driver.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {driver.city} · {driver.vehicleType}
                    </p>
                  </div>
                  <Link
                    href={`/admin/drivers/${driver.id}`}
                    className="text-sm font-semibold text-[#0B1F3D] hover:underline flex-shrink-0"
                  >
                    Manage →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
