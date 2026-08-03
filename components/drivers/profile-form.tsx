'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProfile } from '@/modules/drivers/actions/create-profile'
import { updateProfile } from '@/modules/drivers/actions/update-profile'
import { VEHICLE_CATEGORIES } from '@/modules/drivers/constants/profile-attributes'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { 
  User, 
  Car, 
  Info,
  ChevronRight
} from '@/components/ui/icons'
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
      className="w-full px-8 py-4 bg-[#0B1F3D] text-white rounded-2xl font-black text-lg hover:bg-[#001F3F] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#0B1F3D]/20 flex items-center justify-center gap-2 group"
      disabled={pending || externalBusy}
    >
      {pending ? 'Saving...' : externalBusy ? 'Please wait...' : isUpdate ? 'Update business profile' : 'Create Profile'}
      {!pending && !externalBusy && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
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
    return (
      <div className="flex items-center gap-1.5 mt-1.5 text-red-600 font-bold text-xs">
        <Info className="w-3.5 h-3.5" />
        <span>{state.error[field]?.[0]}</span>
      </div>
    )
  }
  return null
}

function SectionTitle({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: any }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-1.5 text-[#0B1F3D]">
        <Icon className="w-5 h-5" />
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
      </div>
      {subtitle && <p className="text-sm font-medium text-gray-500">{subtitle}</p>}
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
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 lg:p-12 border-b border-gray-50 bg-gray-50/30">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {isUpdate ? 'Business Information' : 'Build Your Business Profile'}
        </h2>
        <p className="text-gray-500 font-medium mt-1">
          {isUpdate ? 'Update your service details and public presence.' : 'Fill out your driver profile to start connecting with customers.'}
        </p>
      </div>
      
      <div className="p-8 lg:p-12">
        <form key={formKey} action={formAction} className="space-y-12">
          {/* Section: Contact & Identity */}
          <section>
            <SectionTitle 
              title="Contact & Identity" 
              subtitle="How customers will find and reach you on the platform" 
              icon={User}
            />

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Public Name *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="e.g. John's Luxury Service"
                  defaultValue={profile?.displayName}
                  required
                />
                <FieldError state={state} field="displayName" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    defaultValue={profile?.phone}
                    required
                  />
                  <FieldError state={state} field="phone" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    defaultValue={profile?.whatsappNumber}
                    required
                  />
                  <FieldError state={state} field="whatsappNumber" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">Primary City *</Label>
                  <SearchableSelect
                    id="city"
                    name="city"
                    required
                    defaultValue={profile?.city ?? ''}
                    placeholder="Search your city..."
                    options={cities.map((c) => ({
                      value: c.name,
                      label: c.name,
                      sublabel: c.state,
                    }))}
                  />
                  <FieldError state={state} field="city" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceAreaText">Specific Service Areas *</Label>
                  <Input
                    id="serviceAreaText"
                    name="serviceAreaText"
                    type="text"
                    placeholder="e.g. Baltimore, BWI, Annapolis, DC Metro"
                    defaultValue={profile?.serviceAreaText}
                    required
                  />
                  <FieldError state={state} field="serviceAreaText" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours (optional)</Label>
                  <Input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    placeholder="e.g. Mon–Sun, 24/7 or 6 AM–8 PM"
                    defaultValue={profile?.operatingHours ?? ''}
                  />
                  <FieldError state={state} field="operatingHours" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availabilityStatus">Current Availability</Label>
                  <select
                    id="availabilityStatus"
                    name="availabilityStatus"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0B1F3D]/5 focus:border-[#0B1F3D] outline-none transition-all bg-white font-bold text-gray-900 appearance-none cursor-pointer"
                    defaultValue={profile?.availabilityStatus || 'AVAILABLE'}
                  >
                    <option value="AVAILABLE">🟢 Available Now</option>
                    <option value="BUSY">🟡 Currently Busy</option>
                    <option value="OFFLINE">⚪ Offline / Not Working</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages Spoken *</Label>
                <Input
                  id="languages"
                  name="languages"
                  type="text"
                  placeholder="e.g. English, Spanish"
                  defaultValue={profile?.languages.join(', ')}
                  required
                />
                <FieldError state={state} field="languages" />
              </div>
            </div>
          </section>

          {/* Section: Vehicle */}
          <section>
            <SectionTitle 
              title="Vehicle Details" 
              subtitle="Information customers use to decide if you're the right fit for their group" 
              icon={Car}
            />

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Category *</Label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    required
                    defaultValue={profile?.vehicleType ?? ''}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0B1F3D]/5 focus:border-[#0B1F3D] outline-none transition-all bg-white font-bold text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select category</option>
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <FieldError state={state} field="vehicleType" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengerCapacity">Passenger Capacity (optional)</Label>
                  <Input
                    id="passengerCapacity"
                    name="passengerCapacity"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="e.g. 4"
                    defaultValue={profile?.passengerCapacity ?? ''}
                  />
                  <FieldError state={state} field="passengerCapacity" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Make (optional)</Label>
                  <Input
                    id="vehicleMake"
                    name="vehicleMake"
                    type="text"
                    placeholder="e.g. Toyota"
                    defaultValue={profile?.vehicleMake ?? ''}
                  />
                  <FieldError state={state} field="vehicleMake" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model (optional)</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    type="text"
                    placeholder="e.g. Camry"
                    defaultValue={profile?.vehicleModel ?? ''}
                  />
                  <FieldError state={state} field="vehicleModel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Year (optional)</Label>
                  <Input
                    id="vehicleYear"
                    name="vehicleYear"
                    type="number"
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    placeholder="e.g. 2022"
                    defaultValue={profile?.vehicleYear ?? ''}
                  />
                  <FieldError state={state} field="vehicleYear" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Vehicle Color (optional)</Label>
                <Input
                  id="vehicleColor"
                  name="vehicleColor"
                  type="text"
                  placeholder="e.g. Black"
                  defaultValue={profile?.vehicleColor ?? ''}
                />
                <FieldError state={state} field="vehicleColor" />
              </div>
            </div>
          </section>

          {/* Section: Additional Details */}
          <section>
            <SectionTitle 
              title="About & Amenities" 
              icon={Info}
            />

            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="bio">About You / Service Description</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  placeholder="Tell customers about your service, experience, and why they should choose you..."
                  defaultValue={profile?.bio ?? ''}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0B1F3D]/5 focus:border-[#0B1F3D] outline-none transition-all bg-white font-medium text-gray-900 min-h-[120px]"
                />
                <FieldError state={state} field="bio" />
              </div>

              {amenities.length > 0 && (
                <div className="space-y-4">
                  <Label>Amenities & Services</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {amenities.map((attr) => (
                      <label
                        key={attr.id}
                        className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all group has-[:checked]:border-[#0B1F3D] has-[:checked]:bg-blue-50/30"
                      >
                        <input
                          type="checkbox"
                          name="amenities"
                          value={attr.key}
                          defaultChecked={selectedAmenities.includes(attr.key)}
                          className="w-5 h-5 rounded-lg border-gray-200 text-[#0B1F3D] focus:ring-[#0B1F3D] cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#0B1F3D]">{attr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethods.length > 0 && (
                <div className="space-y-4">
                  <Label>Payment Methods Accepted</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {paymentMethods.map((attr) => (
                      <label
                        key={attr.id}
                        className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all group has-[:checked]:border-[#0B1F3D] has-[:checked]:bg-blue-50/30"
                      >
                        <input
                          type="checkbox"
                          name="paymentMethods"
                          value={attr.key}
                          defaultChecked={selectedPayments.includes(attr.key)}
                          className="w-5 h-5 rounded-lg border-gray-200 text-[#0B1F3D] focus:ring-[#0B1F3D] cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#0B1F3D]">{attr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="pt-6">
            <SubmitButton 
              isUpdate={isUpdate} 
              externalBusy={externalBusy} 
              onStateChange={onFormStateChange} 
            />
            {state && 'success' in state && state.success && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-2xl text-center font-bold border border-green-100 animate-in fade-in slide-in-from-top-2">
                {('message' in state && state.message) || 'Guardado con éxito'}
              </div>
            )}
            {state?.error && typeof state.error === 'string' && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-2xl text-center font-bold border border-red-100">
                {state.error}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0B1F3D]/5 focus:border-[#0B1F3D] outline-none transition-all bg-white font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium ${props.className || ''}`}
    />
  )
}
