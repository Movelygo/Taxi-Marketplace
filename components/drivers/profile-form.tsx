'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProfile } from '@/modules/drivers/actions/create-profile'
import { updateProfile } from '@/modules/drivers/actions/update-profile'
import { VEHICLE_CATEGORIES } from '@/modules/drivers/constants/profile-attributes'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { ServiceAreaSelect } from '@/components/drivers/service-area-select'
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
      className="w-full px-6 py-3.5 bg-[#0B1F3D] text-white rounded-2xl font-black text-sm hover:bg-[#001F3F] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0B1F3D]/10 flex items-center justify-center gap-2 group"
      disabled={pending || externalBusy}
    >
      {pending ? 'Saving...' : externalBusy ? 'Please wait...' : isUpdate ? 'Update business profile' : 'Create Profile'}
      {!pending && !externalBusy && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
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
  serviceAreaCityIds?: string[]
}

function FieldError({ state, field }: { state: any; field: string }) {
  if (state?.error && typeof state.error === 'object' && field in state.error) {
    return (
      <div className="flex items-center gap-1 mt-1 text-red-600 font-bold text-xs">
        <Info className="w-3 h-3" />
        <span>{state.error[field]?.[0]}</span>
      </div>
    )
  }
  return null
}

function SectionTitle({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: any }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-1.5 text-[#0B1F3D]">
        {Icon && <Icon className="w-5 h-5" />}
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
  serviceAreaCityIds = [],
}: ProfileFormProps) {
  const isUpdate = !!profile
  const action = isUpdate ? updateProfile : createProfile
  const [state, formAction] = useActionState(action, undefined)

  const formKey = profile?.id || 'new-profile'

  const selectedAmenities = profile?.amenities ?? []
  const selectedPayments = profile?.paymentMethods ?? []

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2.5 mb-1.5 text-[#0B1F3D]">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight">
            {isUpdate ? 'Business Details' : 'New Profile'}
          </h2>
        </div>
        <p className="text-sm font-medium text-gray-500">
          {isUpdate ? 'Update your business information' : 'Create your driver profile'}
        </p>
      </div>
      
      <div className="p-6">
        <form key={formKey} action={formAction} className="space-y-10">
          {/* Section: Contact & Identity */}
          <section>
            <SectionTitle 
              title="Identity" 
              subtitle="Essential contact information" 
              icon={User}
            />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Public Name *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="e.g. John's Taxi"
                  defaultValue={profile?.displayName}
                  required
                />
                <FieldError state={state} field="displayName" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1..."
                    defaultValue={profile?.phone}
                    required
                  />
                  <FieldError state={state} field="phone" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsappNumber">WhatsApp *</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    placeholder="+1..."
                    defaultValue={profile?.whatsappNumber}
                    required
                  />
                  <FieldError state={state} field="whatsappNumber" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <SearchableSelect
                    id="city"
                    name="city"
                    required
                    defaultValue={profile?.city ?? ''}
                    placeholder="Search city..."
                    options={cities.map((c) => ({
                      value: c.name,
                      label: c.name,
                      sublabel: c.state,
                    }))}
                  />
                  <FieldError state={state} field="city" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="serviceAreaCityIds">Service Areas *</Label>
                  <ServiceAreaSelect
                    cities={cities}
                    selectedCityIds={serviceAreaCityIds}
                    driverCityId={profile?.cityId}
                    driverCityName={profile?.city}
                  />
                  <p className="text-xs text-gray-500">Select the cities where you offer service.</p>
                  <FieldError state={state} field="serviceAreaCityIds" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="operatingHours">Hours</Label>
                  <Input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    placeholder="e.g. 24/7"
                    defaultValue={profile?.operatingHours ?? ''}
                  />
                  <FieldError state={state} field="operatingHours" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="availabilityStatus">Status</Label>
                  <select
                    id="availabilityStatus"
                    name="availabilityStatus"
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0B1F3D]/5 focus:border-[#0B1F3D] outline-none transition-all bg-white font-bold text-gray-900 appearance-none cursor-pointer"
                    defaultValue={profile?.availabilityStatus || 'AVAILABLE'}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="languages">Languages *</Label>
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
              title="Vehicle" 
              subtitle="Describe your equipment" 
              icon={Car}
            />

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleType">Category *</Label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    required
                    defaultValue={profile?.vehicleType ?? ''}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#0B1F3D]/5 focus:border-[#0B1F3D] outline-none transition-all bg-white font-bold text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select</option>
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <FieldError state={state} field="vehicleType" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="passengerCapacity">Capacity</Label>
                  <Input
                    id="passengerCapacity"
                    name="passengerCapacity"
                    type="number"
                    min={1}
                    max={50}
                    placeholder="4"
                    defaultValue={profile?.passengerCapacity ?? ''}
                  />
                  <FieldError state={state} field="passengerCapacity" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleMake">Make</Label>
                  <Input
                    id="vehicleMake"
                    name="vehicleMake"
                    type="text"
                    placeholder="Toyota"
                    defaultValue={profile?.vehicleMake ?? ''}
                  />
                  <FieldError state={state} field="vehicleMake" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleModel">Model</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    type="text"
                    placeholder="Camry"
                    defaultValue={profile?.vehicleModel ?? ''}
                  />
                  <FieldError state={state} field="vehicleModel" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleYear">Year</Label>
                  <Input
                    id="vehicleYear"
                    name="vehicleYear"
                    type="number"
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    placeholder="2022"
                    defaultValue={profile?.vehicleYear ?? ''}
                  />
                  <FieldError state={state} field="vehicleYear" />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Features */}
          <section>
            <SectionTitle 
              title="Features" 
              icon={Info}
            />

            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="bio">About your service</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Bio..."
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

          <div className="pt-2">
            <SubmitButton 
              isUpdate={isUpdate} 
              externalBusy={externalBusy} 
              onStateChange={onFormStateChange} 
            />
            {state && 'success' in state && state.success && (
              <div className="mt-5 p-4 bg-green-50 text-green-700 rounded-2xl text-center font-bold text-sm border border-green-100 animate-in fade-in slide-in-from-top-1">
                {('message' in state && state.message) || 'Success!'}
              </div>
            )}
            {state?.error && typeof state.error === 'string' && (
              <div className="mt-5 p-4 bg-red-50 text-red-700 rounded-2xl text-center font-bold text-sm border border-red-100">
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
    <label htmlFor={htmlFor} className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
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
