import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { ProfileClient } from './page-client'
import Link from 'next/link'

export const metadata = {
  title: 'Edit Profile | Movely',
  description: 'Manage your driver profile'
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await DriverService.getProfile(user.id)

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to overview
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile ? 'Edit your profile' : 'Create your profile'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {profile
              ? 'Update your driver information and manage your public profile.'
              : 'Set up your driver profile to start connecting with customers.'}
          </p>
        </div>

        <ProfileClient profile={profile} />
      </div>
    </div>
  )
}
