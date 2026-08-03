import { getCurrentUser } from '@/modules/auth/actions/get-current-user'
import { redirect } from 'next/navigation'
import { DriverService } from '@/modules/drivers/services/driver.service'
import { CityService } from '@/modules/cities/services/city.service'
import { GalleryService } from '@/modules/gallery/services/gallery.service'
import { getActiveProfileAttributes } from '@/modules/drivers/actions/get-profile-attributes'
import { ProfileClient } from './page-client'
import Link from 'next/link'
import type { DriverPhoto } from '@prisma/client'

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
  const cities = await CityService.getAllActive()
  const { amenities, paymentMethods } = await getActiveProfileAttributes()

  let photos: DriverPhoto[] = []
  let photoLimit = 2
  if (profile) {
    photos = await GalleryService.getByDriverId(profile.id)
    photoLimit = await GalleryService.getPhotoLimit()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-[#0B1F3D] transition-colors mb-8 group uppercase tracking-widest"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Back to overview
        </Link>

        <div className="mb-10 lg:mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            {profile ? 'Edit business profile' : 'Create your profile'}
          </h1>
          <p className="text-lg font-medium text-gray-500 mt-2 max-w-2xl leading-relaxed">
            {profile
              ? 'Update your driver information and manage your public presence.'
              : 'Set up your driver profile to start connecting with customers.'}
          </p>
        </div>

        <ProfileClient
          profile={profile}
          cities={cities}
          amenities={amenities}
          paymentMethods={paymentMethods}
          photos={photos}
          photoLimit={photoLimit}
        />
      </div>
    </div>
  )
}
