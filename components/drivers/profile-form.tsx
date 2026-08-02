'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProfile } from '@/modules/drivers/actions/create-profile'
import { updateProfile } from '@/modules/drivers/actions/update-profile'
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
    <button 
      type="submit" 
      className="w-full px-6 py-3 bg-[#0B1F3D] text-white rounded-lg font-semibold hover:bg-[#001F3F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending || externalBusy}
    >
      {pending ? 'Saving...' : externalBusy ? 'Please wait...' : isUpdate ? 'Update Profile' : 'Create Profile'}
    </button>
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {isUpdate ? 'Driver Information' : 'Create Your Driver Profile'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isUpdate ? 'Update your driver profile information' : 'Fill out your driver profile to get started'}
        </p>
      </div>
      <div className="p-6">
        <form key={formKey} action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-semibold text-gray-900">
              Display Name *
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="John Smith"
              defaultValue={profile?.displayName}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
            />
            {state?.error && typeof state.error === 'object' && 'displayName' in state.error && (
              <p className="text-sm text-red-500">{state.error.displayName?.[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={profile?.phone}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
              />
              {state?.error && typeof state.error === 'object' && 'phone' in state.error && (
                <p className="text-sm text-red-500">{state.error.phone?.[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsappNumber" className="block text-sm font-semibold text-gray-900">
                WhatsApp Number *
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={profile?.whatsappNumber}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
              />
              {state?.error && typeof state.error === 'object' && 'whatsappNumber' in state.error && (
                <p className="text-sm text-red-500">{state.error.whatsappNumber?.[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-semibold text-gray-900">
              City *
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Baltimore, MD"
              defaultValue={profile?.city}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
            />
            {state?.error && typeof state.error === 'object' && 'city' in state.error && (
              <p className="text-sm text-red-500">{state.error.city?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="serviceAreaText" className="block text-sm font-semibold text-gray-900">
              Service Area *
            </label>
            <input
              id="serviceAreaText"
              name="serviceAreaText"
              type="text"
              placeholder="Baltimore, Columbia, Annapolis, DC Metro"
              defaultValue={profile?.serviceAreaText}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
            />
            {state?.error && typeof state.error === 'object' && 'serviceAreaText' in state.error && (
              <p className="text-sm text-red-500">{state.error.serviceAreaText?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="vehicleType" className="block text-sm font-semibold text-gray-900">
              Vehicle Type *
            </label>
            <input
              id="vehicleType"
              name="vehicleType"
              type="text"
              placeholder="Sedan, SUV, Van, etc."
              defaultValue={profile?.vehicleType}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
            />
            {state?.error && typeof state.error === 'object' && 'vehicleType' in state.error && (
              <p className="text-sm text-red-500">{state.error.vehicleType?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="languages" className="block text-sm font-semibold text-gray-900">
              Languages (comma-separated) *
            </label>
            <input
              id="languages"
              name="languages"
              type="text"
              placeholder="English, Spanish, French"
              defaultValue={profile?.languages.join(', ')}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
            />
            {state?.error && typeof state.error === 'object' && 'languages' in state.error && (
              <p className="text-sm text-red-500">{state.error.languages?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-900">
              Bio (optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              className="w-full min-h-[120px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Tell us about yourself and your driving experience..."
              defaultValue={profile?.bio || ''}
            />
            {state?.error && typeof state.error === 'object' && 'bio' in state.error && (
              <p className="text-sm text-red-500">{state.error.bio?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="availabilityStatus" className="block text-sm font-semibold text-gray-900">
              Availability Status
            </label>
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all bg-white"
              defaultValue={profile?.availabilityStatus || 'AVAILABLE'}
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {state && 'success' in state && state.success === true && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">✓ Profile updated successfully!</p>
            </div>
          )}

          {typeof state?.error === 'string' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{state.error}</p>
            </div>
          )}

          {externalBusy && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Image upload in progress...</p>
            </div>
          )}

          <SubmitButton isUpdate={isUpdate} externalBusy={externalBusy} onStateChange={onFormStateChange} />
        </form>
      </div>
    </div>
  )
}
