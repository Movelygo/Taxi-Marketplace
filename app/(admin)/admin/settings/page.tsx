import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { getSystemConfigs } from '@/modules/system-config/actions/get-configs'
import { SettingsForm } from '@/components/admin/settings-form'

export const metadata = {
  title: 'Settings | Movely Admin',
  description: 'Manage platform configuration',
}

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/login')
  }

  const result = await getSystemConfigs()

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage platform configuration, defaults, and notifications</p>
        </div>
      </div>

      <div className="p-8">
        {result.error ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {result.error}
          </div>
        ) : (
          <SettingsForm configs={result.configs} />
        )}
      </div>
    </div>
  )
}
