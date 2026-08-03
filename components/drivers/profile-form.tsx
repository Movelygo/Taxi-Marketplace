'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProfile } from '@/modules/drivers/actions/create-profile'
import { updateProfile } from '@/modules/drivers/actions/update-profile'
import { VEHICLE_CATEGORIES } from '@/modules/drivers/constants/profile-attributes'
import type { Driver, City, ProfileAttribute } from '@prisma/client'

function SubmitButton({ isUpdate, externalBusy, onStateChange }: {
  isUpdate: boolean
  externalBusy: boolean
  onStateChange?: (pending: boolean) => void
}) {
  const { pending } = useFormStatus()

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
  cities?: City[]
  amenities?: ProfileAttribute[]
  paymentMethods?: ProfileAttribute[]
}

function FieldError({ state, field }: { state: any; field: string }) {
  if (state?.error && typeof state.error === 'object' && field in state.error) {
    return <p className="text-sm text-red-500">{state.error[field]?.[0]}</p>
  }
  return null
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-gray-200 pb-3 mb-4">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export function ProfileForm({
  profile,
  externalBusy = false,
  onFormStateChange,
  cities = [],
  amenities = [],
  paymentMethods = [],
}: ProfileFormProps) {
  const isUpdate = !!profile
  const action = isUpdate ? updateProfile : createProfile
  const [state, formAction] = useActionState(action, undefined)

  const formKey = profile?.id || 'new-profile'

  const selectedAmenities = profile?.amenities ?? []
  const selectedPayments = profile?.paymentMethods ?? []

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
        <form key={formKey} action={formAction} className="space-y-8">
          {/* Section: Contact & Identity */}
          <div>
            <SectionTitle title="Contact & Identity" subtitle="How customers will find and reach you" />

            <div className="space-y-4">
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
                <FieldError state={state} field="displayName" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FieldError state={state} field="phone" />
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
                  <FieldError state={state} field="whatsappNumber" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-900">
                    City *
                  </label>
                  <select
                    id="city"
                    name="city"
                    required
                    defaultValue={profile?.city ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="" disabled>Select your city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}, {city.state}
                      </option>
                    ))}
                  </select>
                  <FieldError state={state} field="city" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="serviceAreaText" className="block text-sm font-semibold text-gray-900">
                    Service Area *
                  </label>
                  <input
                    id="serviceAreaText"
                    name="serviceAreaText"
                    type="text"
                    placeholder="Baltimore, Columbia, BWI, DC Metro"
                    defaultValue={profile?.serviceAreaText}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                  />
                  <FieldError state={state} field="serviceAreaText" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="operatingHours" className="block text-sm font-semibold text-gray-900">
                    Operating Hours <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    placeholder="Mon–Fri, 6 AM–8 PM"
                    defaultValue={profile?.operatingHours ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                  />
                  <FieldError state={state} field="operatingHours" />
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
                <FieldError state={state} field="languages" />
              </div>
            </div>
          </div>

          {/* Section: Vehicle */}
          <div>
            <SectionTitle title="Vehicle" subtitle="Details customers see to decide if you're the right fit" />

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleType" className="block text-sm font-semibold text-gray-900">
                    Vehicle Category *
                  </label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    required
                    defaultValue={profile?.vehicleType ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="" disabled>Select category</option>
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <FieldError state={state} field="vehicleType" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="passengerCapacity" className="block text-sm font-semibold text-gray-900">
                    Passenger Capacity <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="passengerCapacity"
                    name="passengerCapacity"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="4"
                    defaultValue={profile?.passengerCapacity ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                  />
                  <FieldError state={state} field="passengerCapacity" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicleMake" className="block text-sm font-semibold text-gray-900">
                    Make <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="vehicleMake"
                    name="vehicleMake"
                    type="text"
                    placeholder="Toyota"
                    defaultValue={profile?.vehicleMake ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                  />
                  <FieldError state={state} field="vehicleMake" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vehicleModel" className="block text-sm font-semibold text-gray-900">
                    Model <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="vehicleModel"
                    name="vehicleModel"
                    type="text"
                    placeholder="Camry"
                    defaultValue={profile?.vehicleModel ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                  />
                  <FieldError state={state} field="vehicleModel" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vehicleYear" className="block text-sm font-semibold text-gray-900">
                    Year <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="vehicleYear"
                    name="vehicleYear"
                    type="number"
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    placeholder="2020"
                    defaultValue={profile?.vehicleYear ?? ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                  />
                  <FieldError state={state} field="vehicleYear" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="vehicleColor" className="block text-sm font-semibold text-gray-900">
                  Color <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="vehicleColor"
                  name="vehicleColor"
                  type="text"
                  placeholder="Black"
                  defaultValue={profile?.vehicleColor ?? ''}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all"
                />
                <FieldError state={state} field="vehicleColor" />
              </div>
            </div>
          </div>

          {/* Section: Amenities */}
          {amenities.length > 0 && (
            <div>
              <SectionTitle title="Amenities & Services" subtitle="Select all that apply — these show on your profile and power search filters" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map((attr) => (
                  <label
                    key={attr.id}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                  >
                    <input
                      type="checkbox"
                      name="amenities"
                      value={attr.key}
                      defaultChecked={selectedAmenities.includes(attr.key)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0B1F3D] focus:ring-[#0B1F3D]"
                    />
                    <span className="text-gray-700">{attr.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section: Payment Methods */}
          {paymentMethods.length > 0 && (
            <div>
              <SectionTitle title="Payment Methods" subtitle="How customers can pay you directly" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentMethods.map((attr) => (
                  <label
                    key={attr.id}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                  >
                    <input
                      type="checkbox"
                      name="paymentMethods"
                      value={attr.key}
                      defaultChecked={selectedPayments.includes(attr.key)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0B1F3D] focus:ring-[#0B1F3D]"
                    />
                    <span className="text-gray-700">{attr.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section: Bio */}
          <div>
            <SectionTitle title="About You" subtitle="A short bio helps customers trust you" />
            <div className="space-y-2">
              <textarea
                id="bio"
                name="bio"
                className="w-full min-h-[120px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3D] focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell us about yourself and your driving experience..."
                defaultValue={profile?.bio || ''}
              />
              <FieldError state={state} field="bio" />
            </div>
          </div>

          {/* Feedback messages */}
          {state && 'success' in state && state.success === true && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Profile updated successfully!</p>
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
