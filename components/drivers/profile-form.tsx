'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProfile } from '@/modules/drivers/actions/create-profile'
import { updateProfile } from '@/modules/drivers/actions/update-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Driver } from '@prisma/client'

function SubmitButton({ isUpdate, externalBusy, onStateChange }: { 
  isUpdate: boolean
  externalBusy: boolean
  onStateChange?: (pending: boolean) => void
}) {
  const { pending } = useFormStatus()
  
  // Notify parent of state changes
  React.useEffect(() => {
    onStateChange?.(pending)
  }, [pending, onStateChange])
  
  return (
    <Button type="submit" className="w-full" disabled={pending || externalBusy}>
      {pending ? 'Saving...' : externalBusy ? 'Please wait...' : isUpdate ? 'Update Profile' : 'Create Profile'}
    </Button>
  )
}

interface ProfileFormProps {
  profile?: Driver | null
  externalBusy?: boolean
  onFormStateChange?: (pending: boolean) => void
}

export function ProfileForm({ profile, externalBusy = false, onFormStateChange }: ProfileFormProps) {
  const isUpdate = !!profile
  const action = isUpdate ? updateProfile : createProfile
  const [state, formAction] = useActionState(action, undefined)
  
  // Use profile ID as key to remount form when profile changes (fixes uncontrolled/controlled warning)
  const formKey = profile?.id || 'new-profile'
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isUpdate ? 'Edit Profile' : 'Create Your Driver Profile'}</CardTitle>
        <CardDescription>
          {isUpdate ? 'Update your driver profile information' : 'Fill out your driver profile to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form key={formKey} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="John Smith"
              defaultValue={profile?.displayName}
              required
            />
            {state?.error && typeof state.error === 'object' && 'displayName' in state.error && (
              <p className="text-sm text-red-500">{state.error.displayName?.[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={profile?.phone}
                required
              />
              {state?.error && typeof state.error === 'object' && 'phone' in state.error && (
                <p className="text-sm text-red-500">{state.error.phone?.[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={profile?.whatsappNumber}
                required
              />
              {state?.error && typeof state.error === 'object' && 'whatsappNumber' in state.error && (
                <p className="text-sm text-red-500">{state.error.whatsappNumber?.[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Baltimore, MD"
              defaultValue={profile?.city}
              required
            />
            {state?.error && typeof state.error === 'object' && 'city' in state.error && (
              <p className="text-sm text-red-500">{state.error.city?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAreaText">Service Area *</Label>
            <Input
              id="serviceAreaText"
              name="serviceAreaText"
              type="text"
              placeholder="Baltimore, Columbia, Annapolis, DC Metro"
              defaultValue={profile?.serviceAreaText}
              required
            />
            {state?.error && typeof state.error === 'object' && 'serviceAreaText' in state.error && (
              <p className="text-sm text-red-500">{state.error.serviceAreaText?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Input
              id="vehicleType"
              name="vehicleType"
              type="text"
              placeholder="Sedan, SUV, Van, etc."
              defaultValue={profile?.vehicleType}
              required
            />
            {state?.error && typeof state.error === 'object' && 'vehicleType' in state.error && (
              <p className="text-sm text-red-500">{state.error.vehicleType?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (comma-separated) *</Label>
            <Input
              id="languages"
              name="languages"
              type="text"
              placeholder="English, Spanish, French"
              defaultValue={profile?.languages.join(', ')}
              required
            />
            {state?.error && typeof state.error === 'object' && 'languages' in state.error && (
              <p className="text-sm text-red-500">{state.error.languages?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <textarea
              id="bio"
              name="bio"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="Tell us about yourself and your driving experience..."
              defaultValue={profile?.bio || ''}
            />
            {state?.error && typeof state.error === 'object' && 'bio' in state.error && (
              <p className="text-sm text-red-500">{state.error.bio?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">Availability Status</Label>
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue={profile?.availabilityStatus || 'AVAILABLE'}
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {state && 'success' in state && state.success === true && (
            <p className="text-sm text-green-600 font-medium">✓ Profile updated successfully!</p>
          )}

          {typeof state?.error === 'string' && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          {externalBusy && (
            <p className="text-sm text-gray-600">Image upload in progress...</p>
          )}

          <SubmitButton isUpdate={isUpdate} externalBusy={externalBusy} onStateChange={onFormStateChange} />
        </form>
      </CardContent>
    </Card>
  )
}
