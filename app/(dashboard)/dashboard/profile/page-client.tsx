'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/drivers/profile-form'
import { ProfileImageUpload } from '@/components/drivers/profile-image-upload'
import type { Driver, City } from '@prisma/client'

interface ProfileClientProps {
  profile: Driver | null
  cities?: City[]
}

export function ProfileClient({ profile, cities = [] }: ProfileClientProps) {
  const [formBusy, setFormBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form - Takes 2 columns on large screens */}
      <div className="lg:col-span-2">
        <ProfileForm
          profile={profile}
          externalBusy={uploadBusy}
          onFormStateChange={setFormBusy}
          cities={cities}
        />
      </div>
      
      {/* Image Upload Sidebar - Takes 1 column on large screens */}
      {profile && (
        <div className="lg:col-span-1">
          <ProfileImageUpload 
            currentImageUrl={profile.profileImageUrl}
            externalBusy={formBusy}
            onUploadStateChange={setUploadBusy}
          />
        </div>
      )}
    </div>
  )
}
