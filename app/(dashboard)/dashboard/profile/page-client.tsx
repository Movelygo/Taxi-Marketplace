'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/drivers/profile-form'
import { ProfileImageUpload } from '@/components/drivers/profile-image-upload'
import type { Driver } from '@prisma/client'

interface ProfileClientProps {
  profile: Driver | null
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [formBusy, setFormBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)

  return (
    <div className="space-y-8">
      <ProfileForm 
        profile={profile} 
        externalBusy={uploadBusy}
        onFormStateChange={setFormBusy}
      />
      
      {profile && (
        <ProfileImageUpload 
          currentImageUrl={profile.profileImageUrl}
          externalBusy={formBusy}
          onUploadStateChange={setUploadBusy}
        />
      )}
    </div>
  )
}
