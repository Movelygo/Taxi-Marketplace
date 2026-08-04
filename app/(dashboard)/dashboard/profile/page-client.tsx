'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/drivers/profile-form'
import { ProfileImageUpload } from '@/components/drivers/profile-image-upload'
import { GalleryUpload } from '@/components/drivers/gallery-upload'
import type { Driver, City, ProfileAttribute, DriverPhoto } from '@prisma/client'

interface ProfileClientProps {
  profile: Driver | null
  cities?: City[]
  amenities?: ProfileAttribute[]
  paymentMethods?: ProfileAttribute[]
  photos?: DriverPhoto[]
  photoLimit?: number
}

export function ProfileClient({
  profile,
  cities = [],
  amenities = [],
  paymentMethods = [],
  photos = [],
  photoLimit = 2,
}: ProfileClientProps) {
  const [formBusy, setFormBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Main Content - Takes 8 columns */}
      <div className="lg:col-span-8 space-y-6 lg:space-y-8">
        <ProfileForm
          profile={profile}
          externalBusy={uploadBusy}
          onFormStateChange={setFormBusy}
          cities={cities}
          amenities={amenities}
          paymentMethods={paymentMethods}
        />

        {profile && (
          <GalleryUpload photos={photos} limit={photoLimit} />
        )}
      </div>

      {/* Sidebar - Takes 4 columns */}
      <aside className="lg:col-span-4">
        <div className="sticky top-24 space-y-6 lg:space-y-8">
          {profile && (
            <ProfileImageUpload
              currentImageUrl={profile.profileImageUrl}
              externalBusy={formBusy}
              onUploadStateChange={setUploadBusy}
            />
          )}
          
          {/* Help / Guidance Card */}
          <div className="bg-[#0B1F3D] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-2 tracking-tight">Need help?</h3>
              <p className="text-white/60 text-xs font-medium leading-relaxed mb-4">
                Your profile is your business card. Use high-quality photos and clear descriptions to attract more customers.
              </p>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Support: hello@movelygo.com
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          </div>
        </div>
      </aside>
    </div>
  )
}
